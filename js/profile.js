// ========== profile.js ==========
// This file now only handles the Ecco profile logic and "Claim Reward" button.
// No more duplicate "renderElectionList()" or voting functions.

// We assume `rewardCount` is declared in voting.js as a global variable.

// Ecco images array:
const eccoImages = [
    "images/eccos/ecco.png",
    "images/eccos/ecco_balloon.png",
    "images/eccos/ecco_cowboy.png",
    "images/eccos/ecco_hair.png",
    "images/eccos/ecco_pet.png",
    "images/eccos/ecco_pirate.png",
    "images/eccos/ecco_shopping.png"
  ];
  
  // Some silly Ecco fun facts:
  const eccoFunFacts = [
    "Ecco is terrified of medium-sized birds, but fine with big or tiny ones!",
    "Ecco once tried to run for mayor—no one was surprised.",
    "Ecco’s favorite meal is pizza dipped in hot chocolate.",
    "Ecco never forgets a face… especially if they gave him snacks.",
    "Ecco believes Tuesday is the best day for napping."
  ];
  
  // Helper to pick a random item from an array
  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  // Grab references
  const claimRewardBtn = document.getElementById("claim_reward");
  const eccoImgElem = document.getElementById("eccoImage");
  
  // Initialize the reward button to match the global rewardCount (if present)
  document.addEventListener("DOMContentLoaded", () => {
    if (claimRewardBtn) {
      claimRewardBtn.textContent = rewardCount + " rewards Available";
    }
  });
  
  // Handle "Claim Reward"
  if (claimRewardBtn) {
    claimRewardBtn.addEventListener("click", () => {
      if (rewardCount <= 0) {
        alert("No rewards left to claim!");
        return;
      }
  
      // Decrement the reward count
      rewardCount--;
  
      // 1) Randomly decide whether to swap the image or show a fun fact
      //    (e.g., 70% to change the image, 30% to show a fact)
      if (Math.random() < 0.7) {
        // Change Ecco image
        if (eccoImgElem) {
          eccoImgElem.src = getRandomItem(eccoImages);
        }
      } else {
        // Show a fun fact
        alert(getRandomItem(eccoFunFacts));
      }
  
      // 2) Update the button label
      claimRewardBtn.textContent = rewardCount + " rewards Available";
  
      // 3) Log for debugging
      console.log("Claimed a reward! New rewardCount:", rewardCount);
    });
  }
  