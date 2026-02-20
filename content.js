// FINAL VERSION - Proper error handling for privacy-restricted accounts

console.log("🌸 Mutual Finder Extension Loading...");

// Main function
async function getMutuals() {
  console.log("🌸 Starting getMutuals...");
  
  try {
    const pathParts = window.location.pathname.split("/");
    
    if (pathParts[1] !== "users" || !pathParts[2]) {
      return;
    }
    
    const targetUserId = pathParts[2];
    console.log("🌸 Target user ID:", targetUserId);
    
    // Get authenticated user
    const authUserReq = await fetch("https://users.roblox.com/v1/users/authenticated", {
      credentials: "include"
    });
    
    if (!authUserReq.ok) {
      console.warn("🌸 Not logged in");
      displayError("Please log in to see mutual friends! ♡");
      return;
    }
    
    const authUser = await authUserReq.json();
    const myUserId = authUser.id;
    console.log("🌸 My user ID:", myUserId);
    
    if (!targetUserId || !myUserId || targetUserId == myUserId) {
      console.log("🌸 Viewing own profile");
      return;
    }

    // Fetch friends lists
    console.log("🌸 Fetching friends lists...");
    
    let myFriends, targetFriends;
    
    // Get my friends
    try {
      const myFriendsReq = await fetch(`https://friends.roblox.com/v1/users/${myUserId}/friends`, {
        credentials: "include"
      });
      
      if (!myFriendsReq.ok) {
        console.error("🌸 Cannot access my friends:", myFriendsReq.status);
        displayError("Cannot access your friends list");
        return;
      }
      
      myFriends = await myFriendsReq.json();
    } catch (err) {
      console.error("🌸 Network error:", err);
      displayError("Network error, please try again");
      return;
    }
    
    // Get target's friends
    try {
      const targetFriendsReq = await fetch(`https://friends.roblox.com/v1/users/${targetUserId}/friends`, {
        credentials: "include"
      });
      
      if (!targetFriendsReq.ok) {
        console.warn("🌸 Cannot access target friends:", targetFriendsReq.status);
        
        // Handle different error codes with appropriate messages
        if (targetFriendsReq.status === 403) {
          displayPrivacyMessage();
          return;
        } else if (targetFriendsReq.status === 404) {
          displayError("User not found or deleted");
          return;
        } else if (targetFriendsReq.status === 429) {
          displayError("Too many requests, please wait");
          return;
        } else {
          displayError("Cannot access this user's friends list");
          return;
        }
      }
      
      targetFriends = await targetFriendsReq.json();
    } catch (err) {
      console.error("🌸 Network error:", err);
      displayError("Network error, please try again");
      return;
    }
    
    console.log("🌸 My friends:", myFriends?.data?.length || 0);
    console.log("🌸 Target friends:", targetFriends?.data?.length || 0);
    
    if (!myFriends?.data || !targetFriends?.data) {
      console.warn("🌸 Invalid friends data");
      displayError("Unable to load friends data");
      return;
    }

    // Find mutuals
    const myFriendIds = new Set(myFriends.data.map((f) => f.id));
    const mutualIds = targetFriends.data
      .filter((f) => myFriendIds.has(f.id))
      .map((f) => f.id);

    console.log("🌸 Found", mutualIds.length, "mutual friends");

    if (mutualIds.length === 0) {
      displayMutuals([]);
      return;
    }

    // Fetch user details for mutuals
    const nameReq = await fetch("https://users.roblox.com/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIds: mutualIds.slice(0, 50),
        excludeBannedUsers: false,
      }),
      credentials: "include"
    });

    if (!nameReq.ok) {
      console.error("🌸 Error fetching user names");
      displayError("Error loading user details");
      return;
    }

    const nameData = await nameReq.json();
    
    if (!nameData?.data) {
      console.warn("🌸 Invalid user data");
      displayError("Invalid user data");
      return;
    }
    
    const mutualUsers = nameData.data.map((user) => ({
      id: user.id,
      displayName: user.displayName,
      username: user.name,
    }));

    console.log("🌸 Displaying mutuals");
    displayMutuals(mutualUsers);
  } catch (err) {
    console.error("🌸 Unexpected error:", err);
    displayError("An unexpected error occurred");
  }
}

// Font loading
try {
  const fontUrl = chrome.runtime.getURL("starborn.ttf");
  const starbornFont = new FontFace("Starborn", `url(${fontUrl})`);
  starbornFont.load()
    .then((loadedFont) => {
      document.fonts.add(loadedFont);
      console.log("🌸 Font loaded");
    })
    .catch((err) => console.warn("🌸 Font failed:", err));
} catch (err) {
  console.warn("🌸 Font loading error:", err);
}

// Special display for privacy restrictions
function displayPrivacyMessage() {
  const existingContainer = document.getElementById("mutuals-container");
  if (existingContainer) {
    existingContainer.remove();
  }

  const container = document.createElement("div");
  container.id = "mutuals-container";

  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes gentleFadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleSheet);

  container.style.cssText = `
    position: fixed !important;
    top: 80px !important; 
    right: 20px !important;
    width: 240px !important;
    background: #fff5f8 !important; 
    padding: 20px !important; 
    border-radius: 25px !important;
    border: 3px solid #ffc2c7ff !important;
    box-shadow: 0 10px 25px rgba(255, 154, 176, 0.3) !important;
    z-index: 999999 !important;
    animation: gentleFadeIn 0.4s ease-out;
  `;

  container.innerHTML = `
    <div style="
      color: #ff6392ff !important; 
      margin-bottom: 8px !important; 
      font-size: 18px !important; 
      font-weight: normal !important; 
      text-align: center !important; 
      font-family: 'Starborn', sans-serif !important; 
      letter-spacing: 1px !important;
      text-shadow: 
        -1.5px -1.5px 0 #fff,  
         1.5px -1.5px 0 #fff,
        -1.5px  1.5px 0 #fff,
         1.5px  1.5px 0 #fff;
    ">
      MUTUAL FRIENDS
    </div>
    <div style="
      color: #ff94a2ff !important;
      font-size: 13px !important;
      text-align: center !important;
      line-height: 1.5;
      padding: 12px 8px;
    ">
      <div style="margin-bottom: 8px; font-size: 24px;">🔒</div>
      <div style="font-weight: 600; margin-bottom: 6px; color: #ff6392ff;">Friends List Private</div>
      <div style="font-size: 11px; opacity: 0.85; line-height: 1.4;">
        This user's friends list is hidden due to privacy settings or regional restrictions (UK/under 13 accounts).
      </div>
    </div>
    <div style="
      color: #ff85b3 !important;
      font-size: 10px !important;
      text-align: center !important;
      margin-top: 10px;
      opacity: 0.7;
      font-style: italic;
    ">
      Sorry! ಥ_ಥ
    </div>
  `;

  document.body.appendChild(container);
  console.log("🌸 Privacy message displayed");
}

// Generic error display
function displayError(message) {
  const existingContainer = document.getElementById("mutuals-container");
  if (existingContainer) {
    existingContainer.remove();
  }

  const container = document.createElement("div");
  container.id = "mutuals-container";

  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleSheet);

  container.style.cssText = `
    position: fixed !important;
    top: 80px !important; 
    right: 20px !important;
    width: 220px !important;
    background: #fff5f8 !important; 
    padding: 18px !important; 
    border-radius: 25px !important;
    border: 3px solid #ffc2c7ff !important;
    box-shadow: 0 10px 25px rgba(255, 154, 176, 0.3) !important;
    z-index: 999999 !important;
    animation: fadeIn 0.3s ease-out;
  `;

  container.innerHTML = `
    <div style="
      color: #ff6392ff !important; 
      margin-bottom: 5px !important; 
      font-size: 18px !important; 
      font-weight: normal !important; 
      text-align: center !important; 
      font-family: 'Starborn', sans-serif !important; 
      letter-spacing: 1px !important;
      text-shadow: 
        -1.5px -1.5px 0 #fff,  
         1.5px -1.5px 0 #fff,
        -1.5px  1.5px 0 #fff,
         1.5px  1.5px 0 #fff;
    ">
      MUTUAL FRIENDS
    </div>
    <div style="
      color: #ff94a2ff !important;
      font-size: 12px !important;
      text-align: center !important;
      padding: 12px;
      font-style: italic;
      line-height: 1.4;
    ">
      ${message} ಥ_ಥ
    </div>
  `;

  document.body.appendChild(container);
}

// Display mutuals function
function displayMutuals(mutuals) {
  console.log("🌸 displayMutuals:", mutuals.length, "mutuals");
  
  const existingContainer = document.getElementById("mutuals-container");
  if (existingContainer) {
    existingContainer.remove();
  }

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
    top: 80px !important; 
    right: 20px !important;
    width: 220px !important;
    background: #fff5f8 !important; 
    padding: 18px !important; 
    border-radius: 25px !important;
    border: 3px solid #ffc2c7ff !important;
    box-shadow: 0 10px 25px rgba(255, 154, 176, 0.3) !important;
    z-index: 999999 !important;
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
    html += '<p style="color: #ff94a2ff; font-size: 12px; text-align: center; font-style: italic;">none yet! ♡</p>';
  } else {
    html += '<div id="mutuals-list-grid" style="max-height: 350px; overflow-y: auto; padding-right: 5px;">';

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
  console.log("🌸 ✅ Display complete!");
}

// Execution
function shouldRun() {
  return window.location.pathname.match(/^\/users\/\d+\/profile/);
}

function init() {
  if (shouldRun()) {
    console.log("🌸 Running getMutuals in 1 second...");
    setTimeout(() => {
      getMutuals();
    }, 1000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log("🌸 URL changed to:", currentUrl);
    init();
  }
}).observe(document, { subtree: true, childList: true });

console.log("🌸 Extension loaded and ready!");