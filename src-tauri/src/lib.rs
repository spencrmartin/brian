use std::sync::Mutex;
use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::{CommandChild, CommandEvent};

/// Holds the sidecar child process so we can kill it on app exit.
struct SidecarChild(Mutex<Option<CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .manage(SidecarChild(Mutex::new(None)))
        .setup(|app| {
            // ── In debug mode, skip sidecar spawn (dev runs backend manually) ──
            if cfg!(debug_assertions) {
                log::info!(
                    "Brian desktop app started (debug) — run backend manually: \
                     cd brian && python -m brian.main"
                );
                return Ok(());
            }

            // ── Spawn the Python backend sidecar ──
            log::info!("Spawning brian-backend sidecar…");

            let sidecar_cmd = app
                .shell()
                .sidecar("brian-backend")
                .expect("failed to create brian-backend sidecar command");

            let (mut rx, child) = sidecar_cmd.spawn().expect("failed to spawn brian-backend sidecar");

            // Store the child handle in managed state for cleanup.
            {
                let state = app.state::<SidecarChild>();
                let mut guard = state.0.lock().expect("sidecar state lock poisoned");
                *guard = Some(child);
            }

            log::info!("brian-backend sidecar spawned, streaming output…");

            // ── Stream sidecar stdout / stderr to the app log ──
            let log_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            let text = String::from_utf8_lossy(&line);
                            log::info!("[brian-backend] {}", text);
                        }
                        CommandEvent::Stderr(line) => {
                            let text = String::from_utf8_lossy(&line);
                            log::error!("[brian-backend] {}", text);
                        }
                        CommandEvent::Terminated(status) => {
                            log::warn!(
                                "[brian-backend] process terminated with status: {:?}",
                                status
                            );
                            let _ = log_handle.emit("backend-error", "sidecar process terminated unexpectedly");
                            break;
                        }
                        CommandEvent::Error(err) => {
                            log::error!("[brian-backend] error: {}", err);
                        }
                        _ => {}
                    }
                }
            });

            // ── Health-check: poll /health until the backend is ready ──
            let health_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                const MAX_RETRIES: u32 = 30;
                const RETRY_DELAY: std::time::Duration = std::time::Duration::from_secs(1);
                let client = reqwest::Client::new();
                let url = "http://127.0.0.1:8080/health";

                for attempt in 1..=MAX_RETRIES {
                    log::info!("Health check attempt {}/{}…", attempt, MAX_RETRIES);
                    match client.get(url).send().await {
                        Ok(resp) if resp.status().is_success() => {
                            log::info!("brian-backend is healthy (attempt {})", attempt);
                            let _ = health_handle.emit("backend-ready", true);
                            return;
                        }
                        Ok(resp) => {
                            log::warn!(
                                "Health check returned non-success status: {}",
                                resp.status()
                            );
                        }
                        Err(e) => {
                            log::warn!("Health check failed: {}", e);
                        }
                    }
                    tokio::time::sleep(RETRY_DELAY).await;
                }

                log::error!(
                    "brian-backend did not become healthy after {} attempts",
                    MAX_RETRIES
                );
                let _ = health_handle.emit(
                    "backend-error",
                    "backend health check failed after 30 retries",
                );
            });

            Ok(())
        })
        // ── Kill sidecar on window close ──
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                let state = window.state::<SidecarChild>();
                let mut guard = state.0.lock().expect("sidecar state lock poisoned");
                if let Some(child) = guard.take() {
                    log::info!("Killing brian-backend sidecar on window destroy…");
                    let _ = child.kill();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
