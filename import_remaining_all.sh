#!/bin/bash
echo "Importing remaining 25 documents..."

# More Goose documents
for doc in \
  '{"title":"goose: tab'"'"'d instance & BYO Navigations","url":"1tZZ16OHsckItNsbTiiqSbLMFUHnRKJos_GGgLrnecbM","date":"2025-07-10T12:00:00Z","tags":["goose","UI","navigation"]}' \
  '{"title":"goose: Reeds vs Metcalfe","url":"1Y2a3Q9voLEL0hmR15k1q7itLDAVvXT_4kiRxqFfpHUg","date":"2025-06-15T14:00:00Z","tags":["goose","strategy","network-effects"]}' \
  '{"title":"Multi-Instance Goose: Agentic OS Research","url":"10F-CysxNGK5I6IyG9EjfbhHLkQ7TQZ9dTDq2kzpUtLI","date":"2025-04-20T10:00:00Z","tags":["goose","research","multi-instance"]}' \
  '{"title":"g2: Attention Tiles Decision Doc","url":"1SyMxwhvy21tiUNhCBe1BOQdafv099nxaaWAvyS7oJGE","date":"2025-11-05T15:00:00Z","tags":["g2","design","tiles"]}' \
  '{"title":"g2 - PreBxB testing","url":"1HRp-9cQYiOCqfFLY3mXn4p8VcW9_k4XfVE55QReKOqQ","date":"2025-11-10T16:00:00Z","tags":["g2","testing","QA"]}' \
  '{"title":"g2 - Process Server","url":"1WqeJyclql7SVBOhUlEVKecPDllOYl61uMdm4E7takY4","date":"2025-09-05T11:00:00Z","tags":["g2","architecture","workflows"]}' \
  '{"title":"My Hype Doc - 2025-09-04","url":"1vG_5qgiV86IxN8-2wq6QGbacuphlgXaBrUPMPTcjaTU","date":"2025-09-04T12:00:00Z","tags":["personal","ideas"]}' \
  '{"title":"Goose UI/UX Design Notes","url":"1HlRQYdoG8p7-9smq36x_FYkbRMlyHH6I-0y5zioD3TI","date":"2026-01-15T17:02:10Z","tags":["goose","UI","design","notes"]}' \
  '{"title":"Square Appointments - Multiple Booking","url":"1xYmwd92WVoIaBR4ekICC-KyJIXk9Hhtsjs8sY7Rjzdc","date":"2025-08-01T10:00:00Z","tags":["square","appointments"]}' \
  '{"title":"Commerce Future & Goose Build Commands","url":"1UtPC2THXDC1j31EEdmgbXz6jH7fzOjXiFifDB8_yvDk","date":"2025-07-20T14:00:00Z","tags":["goose","commerce","build"]}' \
  '{"title":"Notes with Petersen - Goose Focus","url":"1pIo0nru3vEbzcQPAmcRU-b3C_b5gizIywx6V1nYpBKE","date":"2025-10-15T13:00:00Z","tags":["goose","meeting","agents"]}' \
  '{"title":"Goose Mobile Router & Multi-Chat","url":"1uQ3j18d6jy2GQLDF2j-fUAdpJoOubai__vcNLsgIiQ8","date":"2025-09-20T15:00:00Z","tags":["goose","mobile","architecture"]}' \
  '{"title":"Multi-Client Conversation Design","url":"1p6rKIb7L1yR8w81tB3KYdBx6xekePyL5KTTLGJ-zW4I","date":"2025-10-01T16:00:00Z","tags":["goose","design","multi-client"]}' \
  '{"title":"G2 Kickoff & Space Overlaps","url":"1ufGfFHFbbvOnK29l_DO6FJIcCRBuRbN-Zf-SlOS_nIo","date":"2025-05-10T09:00:00Z","tags":["g2","kickoff"]}' \
  '{"title":"Large Fella Prompt - Enterprise Slack","url":"1f3xHkZW_HXGPsy4HFmtTE-GbzCyhA6nDShzYRAKiB_8","date":"2025-08-26T14:00:00Z","tags":["humor","satire","slack"]}' \
  '{"title":"SwiftUI NodeMatrix Implementation","url":"1mbsW39dWpL3Y0Hsw1nc2Kt0ta7thIH5nsrF6vF3J9A0","date":"2025-11-20T10:00:00Z","tags":["SwiftUI","code","visualization"]}' \
  '{"title":"Goose Multiplayer Vision - OSS","url":"18VWbDM_mQ5KPlroFmt-yM7Nv05KUJVki890Zr4CsWSU","date":"2025-06-10T11:00:00Z","tags":["goose","vision","multiplayer"]}' \
  '{"title":"G2 Design Experience & AI Tools","url":"1YeZ_gDe39dKRCv1lMB8IT0ig4N8nLKWxNUdML4-TS3E","date":"2025-10-05T14:00:00Z","tags":["g2","design","AI"]}' \
  '{"title":"G2 PreBxB QA Testing Guide","url":"1HmEk30Ag3y4HVQgxuHR7l4D_u3X3JtPtNXLZFPN3V2Q","date":"2025-11-12T10:00:00Z","tags":["g2","QA","testing"]}' \
  '{"title":"Goose Memory Management - Aaron","url":"1bhZRrJKG_ksebQIYmS0n9DmoqLbh6RE2s2n04uow118","date":"2025-09-25T13:00:00Z","tags":["goose","memory","management"]}' \
  '{"title":"Low-Effort QA Strategy for G2","url":"1-R3SRRakWCW5B5kQsAjfwB4piDeMb_dMPObn4qMBtgU","date":"2025-11-08T15:00:00Z","tags":["g2","QA","strategy"]}' \
  '{"title":"Goose Recipes - Local Context","url":"1DJVGWNZKnRHgc9ntaZEP8G_YPmzUVfSeczS0I672hdE","date":"2025-10-10T12:00:00Z","tags":["goose","recipes","local-context"]}'; do
  
  TITLE=$(echo $doc | jq -r '.title')
  URL=$(echo $doc | jq -r '.url')
  DATE=$(echo $doc | jq -r '.date')
  TAGS=$(echo $doc | jq -c '.tags')
  
  curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d "{
    \"title\": \"$TITLE\",
    \"content\": \"Document imported from Google Drive\",
    \"url\": \"https://docs.google.com/document/d/$URL/edit\",
    \"item_type\": \"note\",
    \"tags\": $TAGS,
    \"created_at\": \"$DATE\"
  }" | jq -r '.title + " - " + .created_at'
done

echo ""
echo "=== Final Stats ==="
curl -s http://localhost:8080/api/v1/stats | jq '{total_items, by_type}'

