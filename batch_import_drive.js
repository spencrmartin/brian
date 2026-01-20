// Batch import script for Google Drive documents
// This script will be used to coordinate the import of multiple documents with their correct dates

const documents = [
  { id: "1HlRQYdoG8p7-9smq36x_FYkbRMlyHH6I-0y5zioD3TI", title: "Untitled document" },
  { id: "1xYmwd92WVoIaBR4ekICC-KyJIXk9Hhtsjs8sY7Rjzdc", title: "Untitled document" },
  { id: "1o2LyoLU2ha7JLLWvQNvE95XedhYSMSLE7VjYULjpMxk", title: "Untitled document" },
  { id: "1bdtsDeEc3MER71mi9kQRfcxXbmX1YQzXqBHqxxnzo1M", title: "Untitled document" },
  { id: "1HjX2l6FOCXyffWUpv-ajv1MthT7gOknrGF3EO8JFjX8", title: "g2 - Design: Public Launch" },
  { id: "1OzZF0RsoeXm6HCNtEDExQ7P14OX0orq-IgoZYBOEN7k", title: "g2: Sharing and Collaboration" },
  { id: "1de-z-5RwV-myDJygRWiD4uKhQlj_7rHgvisL1_iQg4Y", title: "Untitled document" },
  { id: "1JHu1HU4429UutvK_HjZZxHymIPFa-HY8G3gQhBGBv84", title: "g2 - Design: POV" },
  { id: "1UtPC2THXDC1j31EEdmgbXz6jH7fzOjXiFifDB8_yvDk", title: "Untitled document" },
  { id: "1fmUVYDv8F1dT29ZutrnKJUCg1B08oXd_XcuaZ0fPbOE", title: "Untitled document" },
  { id: "1Tv3ui_PFCEi-td6S10rJw45pcj5B_qM3Mq9p58lbFU8", title: "EZDerm Interview Analysis - Creative Insights" },
  { id: "1hcDfAjP08og6NqsbL-n6Nf-9XBUyvyKnsINnUzUhUbk", title: "g2 - Design hit list" },
  { id: "1mbsW39dWpL3Y0Hsw1nc2Kt0ta7thIH5nsrF6vF3J9A0", title: "Untitled document" },
  { id: "1zr5rHT3B6B3BmS8WYXUspFMcJlAKa5ncu2aFooHMSAA", title: "g2 - Ecosystem" },
  { id: "1pIo0nru3vEbzcQPAmcRU-b3C_b5gizIywx6V1nYpBKE", title: "Untitled document" },
  { id: "1uQ3j18d6jy2GQLDF2j-fUAdpJoOubai__vcNLsgIiQ8", title: "Untitled document" },
  { id: "1gKiL-3KJvkfyBv1IkcHTO8xIfj0ix_6zaKVI0xc9A8w", title: "goose: 2.0" },
  { id: "1p6rKIb7L1yR8w81tB3KYdBx6xekePyL5KTTLGJ-zW4I", title: "Untitled document" },
  { id: "1ATzZstymvtAXT-1S9Jcyi18e3w7ao3BeyB3xiGcJm98", title: "Untitled document" },
  { id: "1ufGfFHFbbvOnK29l_DO6FJIcCRBuRbN-Zf-SlOS_nIo", title: "Untitled document" },
  { id: "1tZZ16OHsckItNsbTiiqSbLMFUHnRKJos_GGgLrnecbM", title: "goose: tab'd instance & BYO Navigations" },
  { id: "1Y2a3Q9voLEL0hmR15k1q7itLDAVvXT_4kiRxqFfpHUg", title: "goose: Reeds vs Metcalfe" },
  { id: "1eK9xtsn1vnvZQja9RsTDStiY5IBhGGmMpjhaPxuRKbs", title: "goose: Adaptive UI II" },
  { id: "14LS_qUEWru_gmUcfthIYg59IctQz0j6TtVKOPxNGT-w", title: "goose: Adaptive UI I" },
  { id: "10F-CysxNGK5I6IyG9EjfbhHLkQ7TQZ9dTDq2kzpUtLI", title: "Multi-Instance Goose: Agentic Operating System Research Foundation" },
  { id: "1g_-b2kyGfd235480BiSORW8iKXMy05229vSoOnZxpWE", title: "Enhanced Research Foundation - Agentic OS with Multi-Instance Collaboration" },
  { id: "1VFzwZjq0FXHPZFOFplTgy1osT3t4jTLFliWSDb6ykqA", title: "Research Foundation - Open Source Agentic OS Platform" },
  { id: "1zs-zgFL4nW19W3dc0ljTuU2dzQBBsPs64tStmqWmu50", title: "Goose Multi-Instance Collaboration Platform - Research Proposal" },
  { id: "18VWbDM_mQ5KPlroFmt-yM7Nv05KUJVki890Zr4CsWSU", title: "Untitled document" },
  { id: "1YeZ_gDe39dKRCv1lMB8IT0ig4N8nLKWxNUdML4-TS3E", title: "Untitled document" },
  { id: "1SyMxwhvy21tiUNhCBe1BOQdafv099nxaaWAvyS7oJGE", title: "g2: Attention Tiles Decision Doc" },
  { id: "1HRp-9cQYiOCqfFLY3mXn4p8VcW9_k4XfVE55QReKOqQ", title: "g2 - PreBxB testing" },
  { id: "1LE-Dc398XygZbwZYZh0vwKh7b2_F-0QJIRgHcQwYUTo", title: "Copy of Testing Document spencer" },
  { id: "1WqeJyclql7SVBOhUlEVKecPDllOYl61uMdm4E7takY4", title: "g2 - Process Server" },
  { id: "13jch9aNuQm1_gmbkxkX7r9-w1oM23lK7qmGal9PLfRU", title: "Testing Document" },
  { id: "1vG_5qgiV86IxN8-2wq6QGbacuphlgXaBrUPMPTcjaTU", title: "My Hype Doc - 2025-09-04" },
  { id: "1OepF1Tsbnn8gi_tMhg5VnnoNwW0hMOIJkimW21VAkEk", title: "Testing handling response" },
  { id: "1yPUGDGRPiGJsZiI-yXhdStsBgLR63kjxU7i_JhM65bI", title: "Copy of Testing Document spencer" },
  { id: "1HmEk30Ag3y4HVQgxuHR7l4D_u3X3JtPtNXLZFPN3V2Q", title: "Untitled document" },
  { id: "12Tm5A68HOekRjKt1OcbVTEfI2WZy-1nII8CtG0sg0lM", title: "Copy of Testing Document - spencer" },
  { id: "1bhZRrJKG_ksebQIYmS0n9DmoqLbh6RE2s2n04uow118", title: "Untitled document" },
  { id: "1f3xHkZW_HXGPsy4HFmtTE-GbzCyhA6nDShzYRAKiB_8", title: "Large fella prompt:" },
  { id: "1-R3SRRakWCW5B5kQsAjfwB4piDeMb_dMPObn4qMBtgU", title: "Untitled document" },
  { id: "1DJVGWNZKnRHgc9ntaZEP8G_YPmzUVfSeczS0I672hdE", title: "Untitled document" }
];

console.log(`Total documents to import: ${documents.length}`);
console.log("\nDocuments list:");
documents.forEach((doc, idx) => {
  console.log(`${idx + 1}. ${doc.title} (${doc.id})`);
});
