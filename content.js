// 1. Stable 2026 API Logic
async function getMutuals() {
  try {
    const pathParts = window.location.pathname.split("/");
    const targetUserId = pathParts[2];
    const userMeta = document.querySelector('meta[name="user-data"]');
    if (!userMeta) return;
    const myUserId = userMeta.getAttribute("data-userid");
    if (!targetUserId || !myUserId || targetUserId === myUserId) return;

    const [myFriendsReq, targetFriendsReq] = await Promise.all([
      fetch(`https://friends.roblox.com/v1/users/${myUserId}/friends`),
      fetch(`https://friends.roblox.com/v1/users/${targetUserId}/friends`),
    ]);

    const myFriends = await myFriendsReq.json();
    const targetFriends = await targetFriendsReq.json();
    if (!myFriends?.data || !targetFriends?.data) return;

    const myFriendIds = new Set(myFriends.data.map((f) => f.id));
    const mutualIds = targetFriends.data
      .filter((f) => myFriendIds.has(f.id))
      .map((f) => f.id);

    if (mutualIds.length === 0) {
      displayMutuals([]);
      return;
    }

    const nameReq = await fetch("https://users.roblox.com/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIds: mutualIds.slice(0, 50),
        excludeBannedUsers: false,
      }),
    });

    const nameData = await nameReq.json();
    const mutualUsers = nameData.data.map((user) => ({
      id: user.id,
      displayName: user.displayName,
      username: user.name,
    }));

    displayMutuals(mutualUsers);
  } catch (err) {
    console.warn("🌸 Mutuals Finder Error:", err);
  }
}

// 2. Font Loading Logic
const fontUrl = chrome.runtime.getURL("starborn.ttf");
const starbornFont = new FontFace("Starborn", `url(${fontUrl})`);

starbornFont
  .load()
  .then((loadedFont) => {
    document.fonts.add(loadedFont);
    console.log("🌸 Starborn font loaded successfully!");
  })
  .catch((err) => {
    console.warn("🌸 Font loading failed:", err);
  });

// 2. UI Rendering Logic
function displayMutuals(mutuals) {
  if (document.getElementById("mutuals-container")) return;

  const container = document.createElement("div");
  container.id = "mutuals-container";

  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
        #mutuals-list-grid::-webkit-scrollbar { width: 5px; }
        #mutuals-list-grid::-webkit-scrollbar-thumb { background: #ffc2ccff; border-radius: 10px; }
        
        .mutual-card {
            transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) !important;
            margin-bottom: 10px;
            background: #ffffff !important;
            box-shadow: 0 2px 5px rgba(255, 182, 193, 0.2) !important;
        }

        .mutual-card:hover { 
            transform: scale(1.05) !important; 
            background: #fff0f5 !important;
            border-color: #ff94a2ff !important; 
            box-shadow: 0 4px 12px rgba(255, 133, 179, 0.4) !important;
        }

        @keyframes popIn {
            0% { transform: scale(0.8) translateX(50px); opacity: 0; }
            100% { transform: scale(1) translateX(0); opacity: 1; }
        }
    `;
  document.head.appendChild(styleSheet);

  container.style.cssText = `
        position: fixed !important;
        top: 60px !important; 
        right: 200px !important;
        width: 200px !important;
        background: #fff5f8 !important; 
        padding: 18px !important; 
        border-radius: 25px !important;
        border: 3px solid #ffc2c7ff !important;
        box-shadow: 0 10px 25px rgba(255, 154, 176, 0.3) !important;
        z-index: 10000 !important;
        animation: popIn 0.4s ease-out;
    `;

  let html = `
        <div style="
            color: #ff6392ff !important; 
            margin-bottom: 2px !important; 
            font-size: 18px !important; 
            font-weight: normal !important; 
            text-align: center !important; 
            font-family: 'Starborn', sans-serif !important; 
            letter-spacing: 1px !important;
            text-shadow: 
                -1.5px -1.5px 0 #fff,  
                 1.5px -1.5px 0 #fff,
                -1.5px  1.5px 0 #fff,
                 1.5px  1.5px 0 #fff, 
                 0px 0px 10px rgba(255, 113, 156, 0.8) !important;
        ">
            MUTUAL FRIENDS
        </div>
        <div style="
            color: #ff6392ff !important;
            font-size: 14px !important;
            text-align: center !important;
            margin-bottom: 8px !important;
            text-shadow: 1px 1px 0px #fff;
        ">
            ⸜(｡˃ ᵕ ˂ )⸝♡
        </div>
        <div style="color: #ff85b3 !important; font-size: 11px !important; text-align: center !important; margin-bottom: 15px !important; font-weight: 800; letter-spacing: 2px; opacity: 0.8;">
            ୨୧ — ${mutuals.length} TOTAL — ୨୧
        </div>
    `;

  if (mutuals.length === 0) {
    html +=
      '<p style="color: #ff94a2ff; font-size: 12px; text-align: center; font-style: italic;">none yet! ♡</p>';
  } else {
    html +=
      '<div id="mutuals-list-grid" style="max-height: 350px; overflow-y: auto; padding-right: 5px;">';

    mutuals.forEach((user) => {
      html += `
                <a href="/users/${user.id}/profile" style="text-decoration: none !important; display: block;">
                    <div class="mutual-card" style="padding: 12px 10px !important; border-radius: 15px !important; border: 1.5px solid #ffdee4ff !important; text-align: center !important;">
                        <div style="color: #4a4a4a !important; font-size: 13px !important; font-weight: 700 !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">
                            ${user.displayName}
                        </div>
                        <div style="color: #ff94a2ff !important; font-size: 10px !important; font-weight: 500 !important; opacity: 0.9;">
                            @${user.username}
                        </div>
                    </div>
                </a>`;
    });
    html += "</div>";
  }

  container.innerHTML = html;
  document.body.appendChild(container);
}

// 3. Execution Logic
const observer = new MutationObserver((mutations, obs) => {
  if (document.querySelector(".profile-header")) {
    getMutuals();
    obs.disconnect();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
