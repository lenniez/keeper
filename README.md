# Keeper

Clickable prototype of **Keeper** (placeholder name), an AI-native task list for busy solo operators. Keeper listens across email, Slack, texts and calls, catches every commitment, and keeps it on one board.

**Live demo:** https://lenniez.github.io/keeper/

## What you can try
- **Onboarding:** pick the channels Keeper listens to (Gmail, Outlook, Slack, a Keeper business line for texts, Zoom, Google Meet).
- **Board:** Backlog, Up Next, In Progress, Blocked, Done. Drag cards between columns (on phones, press and hold a card first). Tap a card to change its status or due date.
- **Incoming feed:** a live preview on the home screen, and a full feed of new and earlier tasks. New tasks arrive every few seconds, or use **Simulate incoming task**.
- **Ask Keeper:** the + button adds a task by typing or voice. Keeper asks for the requester or due date if you don't mention them. Try: “Send Jen the revised logo by Friday with Leo”.
- **Filter:** type in plain language (“Slack tasks for Brightside”, “anything from Marcus”, “overdue”) or use the category, project, collaborator and channel chips.
- **Mobile / Desktop** toggle at the top; **Reset demo** restores the sample data.

## What's simulated
Channel connections and incoming tasks are simulated, and the natural-language parsing is rule-based. Voice entry uses the browser's built-in speech recognition (Chrome, Edge, Safari). Changes are saved only in your browser. See **About** in the prototype for real-world feasibility and costs.

## Run locally
Open `index.html` in a browser. No build step: plain HTML, CSS and JavaScript (`index.html`, `styles.css`, `data.js`, `app.js`).
