/* Sample data for the Keeper prototype. All people and companies are fictional. */
window.KEEPER_DATA = (function () {
  const SOURCES = {
    gmail:   { label: 'Gmail',   color: '#D6453D', desc: 'Emails you send and receive' },
    outlook: { label: 'Outlook', color: '#1C6FD1', desc: 'Microsoft 365 mail and calendar' },
    slack:   { label: 'Slack',   color: '#6B2C70', desc: 'DMs and channels in client workspaces' },
    sms:     { label: 'Business texts', color: '#1F9254', desc: 'A business number your clients can text' },
    zoom:    { label: 'Zoom',    color: '#2D7FF9', desc: 'Commitments from meeting transcripts' },
    meet:    { label: 'Google Meet', color: '#0E8A7E', desc: 'Commitments from Meet transcripts' },
    keeper:  { label: 'Added by you', color: '#6E4BD8', desc: 'Tasks you add with the assistant' }
  };

  const PROJECTS = {
    northwind: { name: 'Northwind Coffee', color: '#B7791F' },
    halcyon:   { name: 'Halcyon Health',   color: '#2F855A' },
    brightside:{ name: 'Brightside Studio',color: '#D53F8C' },
    okafor:    { name: 'Okafor Realty',    color: '#3182CE' },
    lumen:     { name: 'Lumen Labs',       color: '#805AD5' },
    studio:    { name: 'My studio',        color: '#718096' }
  };

  /* role: client (requester) or collaborator */
  const PEOPLE = {
    jen:   { name: 'Jen Park',     role: 'client', project: 'northwind', title: 'Marketing lead, Northwind' },
    marcus:{ name: 'Marcus Lee',   role: 'client', project: 'halcyon',   title: 'Head of digital, Halcyon' },
    dana:  { name: 'Dana Ruiz',    role: 'client', project: 'brightside',title: 'Founder, Brightside' },
    tomi:  { name: 'Tomi Okafor',  role: 'client', project: 'okafor',    title: 'Broker, Okafor Realty' },
    raj:   { name: 'Raj Mehta',    role: 'client', project: 'lumen',     title: 'CEO, Lumen Labs' },
    leo:   { name: 'Leo Grant',    role: 'collab', title: 'Freelance designer' },
    sam:   { name: 'Sam Rivera',   role: 'collab', title: 'Copywriter' },
    priya: { name: 'Priya Shah',   role: 'collab', title: 'Photographer' },
    dev:   { name: 'Dev Patel',    role: 'collab', title: 'Web developer' },
    ana:   { name: 'Ana Costa',    role: 'collab', title: 'PrintWorks (supplier)' },
    maya:  { name: 'Maya',         role: 'me',     title: 'You' }
  };

  const CATEGORIES = ['Communication', 'Coordination', 'Status update', 'Feedback & revisions', 'Deliverables', 'Scope & timeline', 'Purchasing', 'Scheduling'];

  const COLUMNS = [
    { id: 'backlog',    name: 'Backlog' },
    { id: 'upnext',     name: 'Up Next' },
    { id: 'inprogress', name: 'In Progress' },
    { id: 'blocked',    name: 'Blocked' },
    { id: 'done',       name: 'Done' }
  ];

  /* due: days from today (null = no date). ago: minutes since captured. */
  const SEED = [
    { title: 'Send Jen the two logo color options', source: 'gmail', category: 'Deliverables', project: 'northwind', requester: 'jen', collaborators: [], due: 0, status: 'upnext', ago: 95,
      snippet: 'Can you send over the two color options we discussed before our call tomorrow?' },
    { title: 'Revise the Halcyon homepage hero', source: 'zoom', category: 'Feedback & revisions', project: 'halcyon', requester: 'marcus', collaborators: ['dev'], due: 1, status: 'inprogress', ago: 260,
      snippet: 'Maya: “I’ll rework the hero copy and imagery and get Dev a new version by Wednesday.”' },
    { title: 'Send final brand guidelines PDF', source: 'slack', category: 'Deliverables', project: 'brightside', requester: 'dana', collaborators: ['leo'], due: 2, status: 'upnext', ago: 420,
      snippet: 'Dana: can we get the final guidelines PDF this week so the printer can start?' },
    { title: 'Book Priya for the Okafor office shoot', source: 'sms', category: 'Coordination', project: 'okafor', requester: 'tomi', collaborators: ['priya'], due: 1, status: 'blocked', ago: 1500,
      snippet: 'Tomi: Saturday works for the office shoot if your photographer is free?' },
    { title: 'Send weekly status report to Halcyon', source: 'outlook', category: 'Status update', project: 'halcyon', requester: 'marcus', collaborators: [], due: 3, status: 'backlog', ago: 1600,
      snippet: 'Marcus: please keep the Friday status emails coming, leadership reads them.' },
    { title: 'Send Raj the revised deck timeline', source: 'meet', category: 'Scope & timeline', project: 'lumen', requester: 'raj', collaborators: ['sam'], due: 4, status: 'backlog', ago: 2900,
      snippet: 'Maya: “Since we’re adding the investor appendix, I’ll send a revised timeline.”' },
    { title: 'Renew Figma license for the studio', source: 'gmail', category: 'Purchasing', project: 'studio', requester: 'maya', collaborators: [], due: 5, status: 'backlog', ago: 3100,
      snippet: 'Figma: your Professional plan renews in 5 days.' },
    { title: 'Order sample print run from PrintWorks', source: 'gmail', category: 'Purchasing', project: 'brightside', requester: 'dana', collaborators: ['ana'], due: 6, status: 'backlog', ago: 3300,
      snippet: 'Ana: happy to run 20 samples on the uncoated stock once you confirm the order.' },
    { title: 'Book site visit at Okafor’s new office', source: 'sms', category: 'Scheduling', project: 'okafor', requester: 'tomi', collaborators: [], due: 2, status: 'upnext', ago: 4300,
      snippet: 'Tomi: when can you come by to see the space for the signage?' },
    { title: 'Share the Halcyon staging site', source: 'slack', category: 'Deliverables', project: 'halcyon', requester: 'marcus', collaborators: ['dev'], due: -1, status: 'inprogress', ago: 4500,
      snippet: 'Marcus: can we see the staging site before Thursday’s review?' },
    { title: 'Tighten section three of the pitch narrative', source: 'zoom', category: 'Feedback & revisions', project: 'lumen', requester: 'raj', collaborators: ['sam'], due: null, status: 'backlog', ago: 5800,
      snippet: 'Raj: “The story feels heavy in the middle, let’s tighten section three.”' },
    { title: 'Send Tomi the window decal sizes', source: 'sms', category: 'Deliverables', project: 'okafor', requester: 'tomi', collaborators: [], due: -2, status: 'done', ago: 7000,
      snippet: 'Tomi: what sizes do we need for the window decals?' },
    { title: 'Send Northwind menu board files to printer', source: 'outlook', category: 'Deliverables', project: 'northwind', requester: 'jen', collaborators: ['ana'], due: -1, status: 'done', ago: 8200,
      snippet: 'Jen: the menu boards need to be at the printer by Monday.' },
    { title: 'Schedule kickoff call with Lumen Labs', source: 'gmail', category: 'Scheduling', project: 'lumen', requester: 'raj', collaborators: [], due: -3, status: 'done', ago: 9600,
      snippet: 'Raj: let’s find an hour next week to kick off the deck.' }
  ];

  /* Arrive one by one while the demo runs */
  const INCOMING = [
    { title: 'Send Jen the final menu illustrations', source: 'slack', category: 'Deliverables', project: 'northwind', requester: 'jen', collaborators: ['leo'], due: 2,
      snippet: 'Jen: loved the sketches! Can we see the final illustrations by Thursday?' },
    { title: 'Approve the Brightside print proofs', source: 'gmail', category: 'Feedback & revisions', project: 'brightside', requester: 'dana', collaborators: ['ana'], due: 1,
      snippet: 'Ana: proofs are ready, want them couriered or emailed?' },
    { title: 'Reschedule the Halcyon design review', source: 'outlook', category: 'Scheduling', project: 'halcyon', requester: 'marcus', collaborators: [], due: 0,
      snippet: 'Marcus: something came up Thursday, could we move the review to Friday?' },
    { title: 'Add three slides to the investor appendix', source: 'sms', category: 'Deliverables', project: 'lumen', requester: 'raj', collaborators: [], due: 0,
      snippet: 'Raj: quick q, do we have room for 3 more slides in the appendix?' },
    { title: 'Send Priya the shot list', source: 'zoom', category: 'Coordination', project: 'okafor', requester: 'tomi', collaborators: ['priya'], due: 3,
      snippet: 'Maya: “I’ll send Priya the shot list so she can plan the lighting.”' },
    { title: 'Send Dana the launch assets status report', source: 'slack', category: 'Status update', project: 'brightside', requester: 'dana', collaborators: [], due: 1,
      snippet: 'Dana: how are we tracking on the launch assets?' },
    { title: 'Buy stock photo licenses for the Halcyon blog', source: 'meet', category: 'Purchasing', project: 'halcyon', requester: 'marcus', collaborators: ['dev'], due: 2,
      snippet: 'Maya: “I’ll grab the license for the two hero photos today.”' },
    { title: 'Add back-entrance sign to the Okafor scope', source: 'gmail', category: 'Scope & timeline', project: 'okafor', requester: 'tomi', collaborators: [], due: 4,
      snippet: 'Tomi: we’d also like a sign for the back entrance, can you add that?' }
  ];

  return { SOURCES, PROJECTS, PEOPLE, CATEGORIES, COLUMNS, SEED, INCOMING };
})();
