/**
 * Script to import Google Drive documents into Brian knowledge base
 * 
 * This script will:
 * 1. Search for documents from the past 2 months
 * 2. Read their content
 * 3. Create knowledge items in the Brian database
 */

// Documents found from Google Drive search (past 2 months)
const documents = [
  {
    id: '1czerJg8xXfA0ZWP3sjq42ob_-23JTVq6m6f-RPzjVmg',
    title: 'Pre-Auth Tipping: US Rollout',
    url: 'https://docs.google.com/document/d/1czerJg8xXfA0ZWP3sjq42ob_-23JTVq6m6f-RPzjVmg/edit',
    type: 'paper'
  },
  {
    id: '1_cHYxmZljo_ca222ukyLyd6VnJ-sPdc3ZxQlGv2Wd8Q',
    title: 'Receipt Printing Over Orders from TA and OM - 2026 Kickoff',
    url: 'https://docs.google.com/document/d/1_cHYxmZljo_ca222ukyLyd6VnJ-sPdc3ZxQlGv2Wd8Q/edit',
    type: 'paper'
  },
  {
    id: '1xsnPQWLoDTWrjR0081qHiH9tq_wYKhOM9QGJihZy5Ng',
    title: 'Checkout Flow Specification (go/cxfspec)',
    url: 'https://docs.google.com/document/d/1xsnPQWLoDTWrjR0081qHiH9tq_wYKhOM9QGJihZy5Ng/edit',
    type: 'paper'
  },
  {
    id: '1cIcM8-yE8C8If5SdKyCh60U2PVnfcRY9WBYQ83E77Tw',
    title: 'Split Payments-Split Tenders Seller Feedback Analysis',
    url: 'https://docs.google.com/document/d/1cIcM8-yE8C8If5SdKyCh60U2PVnfcRY9WBYQ83E77Tw/edit',
    type: 'paper'
  },
  {
    id: '1iAoym_sDtEEBgHJRiJ6l3H_NzVQ72imOTYQON98JDJQ',
    title: 'Signatures Runbook',
    url: 'https://docs.google.com/document/d/1iAoym_sDtEEBgHJRiJ6l3H_NzVQ72imOTYQON98JDJQ/edit',
    type: 'paper'
  },
  {
    id: '1c6HCGZA0nc4inUmoNuXPTVbircBQFH55r_jvPAr9NoA',
    title: 'FR LNE Server Eng Design',
    url: 'https://docs.google.com/document/d/1c6HCGZA0nc4inUmoNuXPTVbircBQFH55r_jvPAr9NoA/edit',
    type: 'paper'
  },
  {
    id: '1g6O96blaUCNH6plfCwDYRtxMvwQeWbstl9-txC0PMLY',
    title: 'Tips-fe Runbook',
    url: 'https://docs.google.com/document/d/1g6O96blaUCNH6plfCwDYRtxMvwQeWbstl9-txC0PMLY/edit',
    type: 'paper'
  },
  {
    id: '19MqocTJ9vqi8QuGUiRm9lrIxdCls45ec5wBxThx8MXo',
    title: 'PRD Template 2 - Master (go/prd)',
    url: 'https://docs.google.com/document/d/19MqocTJ9vqi8QuGUiRm9lrIxdCls45ec5wBxThx8MXo/edit',
    type: 'paper'
  },
  {
    id: '1sDJc9v_TI7rUtiNdHUTY4iQStkaXcVtmX80BoX_FQbw',
    title: 'Custom BuilderWeekly Standup',
    url: 'https://docs.google.com/document/d/1sDJc9v_TI7rUtiNdHUTY4iQStkaXcVtmX80BoX_FQbw/edit',
    type: 'note'
  },
  {
    id: '1Frk19aeLm123Vg5T4oX8FmJMn6F8wOOmO0ylB8UIasU',
    title: 'Auto Settle Launch Announcement',
    url: 'https://docs.google.com/document/d/1Frk19aeLm123Vg5T4oX8FmJMn6F8wOOmO0ylB8UIasU/edit',
    type: 'paper'
  },
  {
    id: '1C0oNxd2oSF8cbyqzTdYkx_aPNZquWVwXUYkzILaCYqo',
    title: 'CheckoutFE Runbook',
    url: 'https://docs.google.com/document/d/1C0oNxd2oSF8cbyqzTdYkx_aPNZquWVwXUYkzILaCYqo/edit',
    type: 'paper'
  },
  {
    id: '16iwpzniHGUhkmYqTnUDwyM-X_HjA_GvZNz7ygl0swSQ',
    title: 'Copy of [ADR - #0163] - Code Review Expectations RFC',
    url: 'https://docs.google.com/document/d/16iwpzniHGUhkmYqTnUDwyM-X_HjA_GvZNz7ygl0swSQ/edit',
    type: 'paper'
  },
  {
    id: '180xUWBYc6uyU0NFDUIi_blJIBRuSWCHTxkjprEaKm48',
    title: '[TDR] Internal WG Meeting Notes',
    url: 'https://docs.google.com/document/d/180xUWBYc6uyU0NFDUIi_blJIBRuSWCHTxkjprEaKm48/edit',
    type: 'note'
  },
  {
    id: '16YYrYaXFBTgLixWaVeqqR6fQTPFkqlkjrKO8CEOY078',
    title: '[Eng Design] WebSRM on Mobile',
    url: 'https://docs.google.com/document/d/16YYrYaXFBTgLixWaVeqqR6fQTPFkqlkjrKO8CEOY078/edit',
    type: 'paper'
  },
  {
    id: '1kSNqW3u5ULtVgweozth0G0pC04mZePbtY60tHifUIbI',
    title: 'OrdersFE Runbook',
    url: 'https://docs.google.com/document/d/1kSNqW3u5ULtVgweozth0G0pC04mZePbtY60tHifUIbI/edit',
    type: 'paper'
  }
];

console.log(`Found ${documents.length} documents to import from Google Drive`);
console.log('\nDocuments:');
documents.forEach((doc, i) => {
  console.log(`${i + 1}. ${doc.title}`);
});

console.log('\n✅ Document list prepared!');
console.log('\nNext steps:');
console.log('1. I will read the content from each Google Doc');
console.log('2. Extract key information and summaries');
console.log('3. Create knowledge items in your Brian database');
console.log('4. Add relevant tags based on document content');
