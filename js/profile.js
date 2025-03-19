// ========== profile.js ==========
// This file only handles Ecco images, fun facts, and the "Claim Reward" button.

// We assume "rewardCount" is declared in voting.js.

// Ecco images
const eccoImages = [
    "images/eccos/ecco.png",
    "images/eccos/ecco_balloon.png",
    "images/eccos/ecco_cowboy.png",
    "images/eccos/ecco_hair.png",
    "images/eccos/ecco_pet.png",
    "images/eccos/ecco_pirate.png",
    "images/eccos/ecco_shopping.png"
  ];
  
  // Ecco fun facts
  const eccoFunFacts = [
    "Ecco is terrified of medium-sized birds, but fine with big or tiny ones!",
    "Ecco once tried to run for mayor—no one was surprised.",
    "Ecco’s favorite meal is pizza dipped in hot chocolate.",
    "Ecco never forgets a face… especially if they gave him snacks.",
    "Ecco believes Tuesday is the best day for napping."
  ];
  
  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  // Claim Reward button
  const claimRewardBtn = document.getElementById("claim_reward");
  const eccoImgElem = document.getElementById("eccoImage");
  
  if (claimRewardBtn) {
    claimRewardBtn.addEventListener("click", () => {
      if (rewardCount <= 0) {
        alert("No rewards left to claim!");
        return;
      }
      // Decrement reward count
      rewardCount--;
  
      // 70% chance to change Ecco image, 30% to show a fun fact
      if (Math.random() < 0.7) {
        if (eccoImgElem) {
          eccoImgElem.src = getRandomItem(eccoImages);
        }
      } else {
        alert(getRandomItem(eccoFunFacts));
      }
  
      // Update button & badge
      updateRewardDisplays();
    });
  }