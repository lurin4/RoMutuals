// 1. Stable 2025 API Logic
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

// 2. The Final Cutesy UI
function displayMutuals(mutuals) {
  if (document.getElementById("mutuals-container")) return;

  const container = document.createElement("div");
  container.id = "mutuals-container";

  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
        #mutuals-list-grid::-webkit-scrollbar { width: 6px; }
        #mutuals-list-grid::-webkit-scrollbar-thumb { background: #ffdeeb; border-radius: 10px; }
        
        .mutual-card {
            transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.2s, box-shadow 0.2s !important;
        }

        /* Fixed Hover: Increased headroom and safety */
        .mutual-card:hover { 
            transform: translateY(-8px) !important; 
            box-shadow: 0 8px 20px rgba(255, 167, 201, 0.6) !important; 
            border-color: #ff85b3 !important; 
            background: rgba(255, 255, 255, 0.95) !important;
            z-index: 10 !important;
        }
    `;
  document.head.appendChild(styleSheet);

  // FIXED: rgba background lets RoPro backgrounds show through
  container.style.cssText = `
        background: rgba(0, 0, 0, 0.45) !important; 
        padding: 5px 60px 25px 60px !important; 
        border-radius: 18px !important;
        margin: 10px 0 !important;
        border: 2px solid #ffdeeb !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
        width: 100% !important;
        display: block !important;
        clear: both !important;
        box-sizing: border-box !important;
        text-align: center !important;
        overflow: visible !important;
    `;

  let html = `
        <h3 style="color: #ffa7c9ff !important; margin-top: 10px !important; margin-bottom: 20px !important; font-size: 18px !important; font-weight: bold !important; font-family: sans-serif !important; text-align: center !important; text-shadow: 1px 1px 3px rgba(0,0,0,0.5) !important;">
            ᯓ★ Mutual Friends (${mutuals.length})
        </h3>
    `;

  if (mutuals.length === 0) {
    html +=
      '<p style="color: #ffb3d1 !important; font-size: 14px !important; font-style: italic !important; text-align: center;">got no mutuals :(</p>';
  } else {
    // FIXED: Added 15px top padding to grid to prevent clipping on hover
    html +=
      '<div id="mutuals-list-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; max-height: 300px; overflow-y: auto; overflow-x: hidden; padding: 15px 5px 10px 5px; transition: all 0.3s ease; justify-content: center !important; box-sizing: border-box !important;">';

    mutuals.forEach((user) => {
      html += `
                <div class="mutual-card" style="background: rgba(255, 255, 255, 0.75) !important; backdrop-filter: blur(6px) !important; -webkit-backdrop-filter: blur(6px) !important; padding: 14px 8px !important; border-radius: 12px !important; border: 1px solid #ffe3ed !important; text-align: center !important; cursor: pointer; min-width: 0 !important; position: relative !important;">
                    
                    <a href="/users/${user.id}/profile" style="color: #080808ff !important; text-shadow: 0.5px 0.5px 1px rgba(255, 255, 255, 0.8) !important; text-decoration: none !important; font-size: 15px !important; font-weight: bold !important; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px !important;">
                        ${user.displayName}
                    </a>
                    
                    <div style="color: #ff96b0 !important; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5) !important; font-size: 11px !important; font-weight: 600 !important; overflow: hidden; text-overflow: ellipsis;">
                        @${user.username}
                    </div>
                </div>`;
    });
    html += "</div>";
  }

  container.innerHTML = html;

  const anchor =
    document.querySelector(".header-caption") ||
    document.querySelector(".profile-header");
  if (anchor) {
    anchor.appendChild(container);
  }
}

// 3. Execution Logic
const observer = new MutationObserver((mutations, obs) => {
  if (document.querySelector(".header-caption")) {
    getMutuals();
    obs.disconnect();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
setTimeout(getMutuals, 3000);
