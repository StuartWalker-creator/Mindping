localStorage.setItem("hasVisited","true")
// ---------- Constants ----------
const FREE_LIMIT = 7;
const isPro = localStorage.getItem("mindping_pro") === "true";

// ---------- Theme ----------
const toggleBtn = document.getElementById("themeToggle");
if (toggleBtn) {
  toggleBtn.onclick = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.theme = isDark ? "dark" : "light";
    toggleBtn.textContent = isDark ? "☀️" : "🌙";
  };
  toggleBtn.textContent =
    document.documentElement.classList.contains("dark") ? "☀️" : "🌙";
}

// ---------- Prompts ----------
const prompts = [
  "What’s been on your mind lately?",
  "What are you avoiding right now?",
  "What went well yesterday?",
  "What do you need more of this week?",
  "What’s one thing you’re grateful for today?"
];

function getTodayPrompt() {
  const start = new Date("2025-01-01");
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return prompts[diff % prompts.length];
}

// ---------- Storage ----------
function getEntries() {
  return JSON.parse(localStorage.getItem("mindping_entries") || "[]");
}

function saveEntry(entry) {
  const entries = getEntries();
  entries.unshift(entry);
  localStorage.setItem("mindping_entries", JSON.stringify(entries));
}

// ---------- Paywall Modal ----------
function showPaywall() {
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50";

  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
      <h2 class="text-xl font-semibold">Upgrade to Pro</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        You’ve reached the free limit of ${FREE_LIMIT} entries.
      </p>

      <button id="upgradeBtn"
        class="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-2xl font-medium hover:bg-gray-400 transition-colors">
        Upgrade — $5 Lifetime
      </button>

      <button id="closePaywall"
        class="text-sm text-gray-500 hover:underline">
        Not now
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("closePaywall").onclick = () => modal.remove();
document.getElementById("upgradeBtn").onclick = async () => {
  window.location.href="https://stuartwebdev.lemonsqueezy.com/checkout/buy/0c6eb784-f770-433e-b808-1f2a7c4a5421"

};
  
}

// ---------- Mood ----------
let selectedMood = null;
document.querySelectorAll(".mood-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMood = Number(btn.dataset.mood);
  };
});

// ---------- Today ----------
if (document.getElementById("prompt")) {
  const promptText = getTodayPrompt();
  document.getElementById("prompt").innerText = promptText;

  document.getElementById("saveBtn").onclick = () => {
    const content = document.getElementById("entry").value.trim();
    if (!content) return alert("Write something first.");

    const entries = getEntries();
    if (!isPro && entries.length >= FREE_LIMIT) {
      showPaywall();
      return;
    }

    saveEntry({
      date: new Date().toISOString().slice(0, 10),
      prompt: promptText,
      content,
      mood: selectedMood
    });

    window.location.href = "history.html";
  };
}

//---------export CSV logic------

if (document.getElementById("exportCSVBtn")) {
  
const exportBtn = document.getElementById("exportCSVBtn")

function exportToCSV(entries) {
  if (!entries.length) {
    alert("No entries to export!");
    return;
  }
  
  const header = ["Date", "Prompt", "Content"];
  const rows = entries.map(e => [
    `"${e.date}"`,
    `"${e.prompt.replace(/"/g, '""')}"`,
    `"${e.content.replace(/"/g, '""')}"`
  ].join(","));
  
  const csvContent = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Create temporary <a>
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `mindping_journal_${Date.now()}.csv`;
  
  // Append to DOM
  document.body.appendChild(link);
  
  // Trigger click
  link.click();
  console.log(link)
  // Clean up
  //document.body.removeChild(link);
  URL.revokeObjectURL(link.href); // important to free memory
}
exportBtn.addEventListener("click", () => {
  
  const entries = JSON.parse(localStorage.getItem("mindping_entries") || "[]");

  if (!isPro) {
    showProOverlay();
    return;
  }

  exportToCSV(entries);
});
}
//overly function 
function showProOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "proOverlay";
  overlay.className = `
    fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4
  `;
  overlay.classList.add("transition-opacity", "duration-300", "opacity-0");
setTimeout(() => overlay.classList.remove("opacity-0"), 10);

  overlay.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
      <h2 class="text-xl font-semibold">Pro Feature</h2>
      <p class="text-gray-600 dark:text-gray-400 text-sm">
        Exporting CSV is only available for Pro users.
      </p>
      <button id="upgradeCSVBtn" class="w-full bg-black text-white py-3 rounded-2xl font-medium">
        Upgrade — $5 Lifetime
      </button>
      <button id="closeOverlayBtn" class="text-sm text-gray-500 hover:underline">
        Cancel
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close overlay
  document.getElementById("closeOverlayBtn").onclick = () => overlay.remove();

  // Upgrade button
  document.getElementById("upgradeCSVBtn").onclick = async () => {
  window.location.href="https://stuartwebdev.lemonsqueezy.com/checkout/buy/0c6eb784-f770-433e-b808-1f2a7c4a5421"
  };
}
// ---------- History ----------
if (document.getElementById("entries")) {
  const entries = getEntries();
  const container = document.getElementById("entries");
  const moods = ["", "😞", "😐", "🙂", "😊", "😄"];

  if (!isPro && entries.length >= FREE_LIMIT) {
    const banner = document.createElement("div");
    banner.className =
      "bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-2xl text-sm";
    banner.innerHTML = `
      You’re viewing the last ${FREE_LIMIT} entries.
      <button id="upgradeInline" class="underline font-medium ml-1">
        Upgrade
      </button>
    `;
    container.appendChild(banner);
    setTimeout(() => {
      document.getElementById("upgradeInline").onclick = showPaywall;
    }, 0);
  }

  const visible = isPro ? entries : entries.slice(0, FREE_LIMIT);

  visible.forEach(e => {
    const div = document.createElement("div");
    div.className = "bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm";
    div.innerHTML = `
      <p class="text-xs text-gray-400 mb-2">${e.date}</p>
      <p class="font-medium mb-2">${e.prompt}</p>
      <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">${e.content}</p>
      ${e.mood ? `<div class="mt-2 text-xl">${moods[e.mood]}</div>` : ""}
    `;
    container.appendChild(div);
  });
}

//----PRO Bagde---
const proBadge = document.getElementById("proBadge");

if (localStorage.getItem("mindping_pro") === "true") {
  proBadge.classList.remove("hidden");
}

//mobile nav
const menuBtn = document.getElementById("menuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const mobileNav = document.getElementById("mobileNav");
const mobileUpgradeBtn = document.getElementById("mobileUpgradeBtn");



// Show PRO badg
if (isPro) {
  proBadge.classList.remove("hidden");
  mobileUpgradeBtn?.remove(); // remove CTA for Pro users
}

// Open menu
menuBtn.onclick = () => {
  mobileNav.classList.remove("hidden");
};

// Close menu
closeMenuBtn.onclick = () => {
  mobileNav.classList.add("hidden");
};

// Upgrade CTA
mobileUpgradeBtn?.addEventListener("click", async () => {
  window.location.href="https://stuartwebdev.lemonsqueezy.com/checkout/buy/0c6eb784-f770-433e-b808-1f2a7c4a5421"

});

//desktop nav


const desktopUpgradeBtn = document.getElementById("desktopUpgradeBtn");

if (isPro) {
  proBadge?.classList.remove("hidden");
} else {
  desktopUpgradeBtn?.classList.remove("hidden");
}

desktopUpgradeBtn?.addEventListener("click", async () => {
  window.location.href="https://stuartwebdev.lemonsqueezy.com/checkout/buy/0c6eb784-f770-433e-b808-1f2a7c4a5421"
});