  
  // Render the election list inside #electionList
  function renderElectionList() {
    const electionList = document.getElementById("electionList");
    if (!electionList) return; // safety check
    electionList.innerHTML = "";
  
    elections.forEach(election => {
      const block = document.createElement("div");
      block.className = "election-block";
      block.onclick = () => startElection(election.id);
      block.innerHTML = `
        <h2>${election.institution}</h2>
        <p><strong>Time:</strong> ${election.timeRemaining}</p>
        <p><strong>Positions:</strong> ${election.positionsCount}</p>
        <p><strong>Reward:</strong> ${election.reward}</p>
      `;
      electionList.appendChild(block);
    });
  }
  
  function startElection(electionId) {
    currentElection = elections.find(e => e.id === electionId);
    currentPositionIndex = 0;
    selectedCandidate = null;
  
    // Update the position view title
    document.getElementById("positionElectionTitle").textContent = currentElection.institution;
    showView("positionView");
    renderCurrentPosition();
  }
  
  function renderCurrentPosition() {
    const posContainer = document.getElementById("positionBlock");
    if (!posContainer) return;
  
    posContainer.innerHTML = "";
    if (currentPositionIndex >= currentElection.positions.length) {
      renderReviewSummary();
      showView("reviewView");
      return;
    }
  
    const position = currentElection.positions[currentPositionIndex];
    const posBlock = document.createElement("div");
    posBlock.className = "position-block";
    posBlock.innerHTML = `
      <div class="position-info">
        <h2>Position: ${position.title}</h2>
        <p>${position.info}</p>
        <a href="${position.moreInfoLink}" target="_blank">More Info</a>
      </div>
      <div class="candidates" id="candidatesContainer"></div>
      <div id="voteConfirmation" style="margin-top:15px;"></div>
    `;
    posContainer.appendChild(posBlock);
  
    renderCandidates(position.candidates);
  }
  
  function renderCandidates(candidates) {
    const container = document.getElementById("candidatesContainer");
    if (!container) return;
    container.innerHTML = "";
  
    candidates.forEach(candidate => {
      const candidateDiv = document.createElement("div");
      candidateDiv.className = "candidate-block";
      candidateDiv.onclick = () => openCandidatePanel(candidate);
      candidateDiv.innerHTML = `
        <img src="${candidate.image}" alt="${candidate.name}">
        <p>${candidate.name}</p>
        ${candidate.bestChoice ? '<div class="best-choice">★</div>' : ""}
      `;
      container.appendChild(candidateDiv);
    });
  }
  
  // Candidate Panel
  function openCandidatePanel(candidate) {
    selectedCandidate = candidate;
    document.getElementById("candidateImage").src = candidate.image;
    document.getElementById("candidateName").textContent = candidate.name;
    document.getElementById("candidateManifesto").textContent = candidate.manifesto;
    document.getElementById("candidateAISummary").textContent = candidate.aiSummary;
  
    const socialDiv = document.getElementById("candidateSocial");
    socialDiv.innerHTML = "";
    for (const [platform, link] of Object.entries(candidate.social)) {
      const anchor = document.createElement("a");
      anchor.href = link;
      anchor.textContent = platform;
      anchor.target = "_blank";
      socialDiv.appendChild(anchor);
    }
  
    document.getElementById("candidateOverlay").classList.add("active");
  }
  
  function closeCandidatePanel() {
    document.getElementById("candidateOverlay").classList.remove("active");
  }
  
  // Voting
  function voteForCandidate() {
    const position = currentElection.positions[currentPositionIndex];
    position.vote = selectedCandidate;
    closeCandidatePanel();
  
    const voteConf = document.getElementById("voteConfirmation");
    voteConf.innerHTML = `
      <p>You selected <strong>${selectedCandidate.name}</strong> for ${position.title}.</p>
      <button class="btn" onclick="confirmVote()">Confirm Vote</button>
    `;
  }
  
  function confirmVote() {
    document.getElementById("rewardOverlay").classList.add("active");
  }
  
  function rewardConfirmed() {
    document.getElementById("rewardOverlay").classList.remove("active");
    currentPositionIndex++;
    selectedCandidate = null;
    renderCurrentPosition();
  }
  
  // Skip / Exit
  function skipPosition() {
    currentElection.positions[currentPositionIndex].vote = "Skipped";
    currentPositionIndex++;
    selectedCandidate = null;
    renderCurrentPosition();
  }
  
  function exitElection() {
    alert("Exiting election. Your progress has been saved.");
    showView("electionView");
  }
  
  // Review Summary
  function renderReviewSummary() {
    const reviewContainer = document.getElementById("reviewSummary");
    if (!reviewContainer) return;
    reviewContainer.innerHTML = "";
  
    currentElection.positions.forEach(position => {
      const summary = document.createElement("div");
      summary.className = "summary-block";
      summary.innerHTML = `
        <h3>${position.title}</h3>
        <p><strong>Your Choice:</strong> ${
          position.vote
            ? (typeof position.vote === "object" ? position.vote.name : position.vote)
            : "No vote"
        }</p>
      `;
      reviewContainer.appendChild(summary);
    });
  }
  
  function backToElections() {
    currentElection = null;
    currentPositionIndex = 0;
    selectedCandidate = null;
    showView("electionView");
  }

// ========== profile.js ==========

// Access the global 'rewardCount' from voting.js
// Make sure your <script src="js/voting.js"> is included before this file in HTML.

// An array of your Ecco images:
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
    "Ecco is terrified of medium-sized birds, but fine with very big or small ones!",
    "Ecco once tried to run for mayor—no one was surprised.",
    "Ecco’s favorite meal is pizza dipped in hot chocolate.",
    "Ecco never forgets a face… especially if they gave him snacks.",
    "Ecco believes Tuesday is the best day for napping."
  ];
  
  // Helper to pick a random item from an array:
  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  // Attach to the "Claim Reward" button in your HTML
  const claimRewardBtn = document.getElementById("claim_reward");
  const eccoImgElem = document.getElementById("eccoImage");
  
  if (claimRewardBtn) {
    // Update initial button label to match current rewardCount
    claimRewardBtn.textContent = rewardCount + " rewards Available";
  
    claimRewardBtn.addEventListener("click", () => {
      if (rewardCount <= 0) {
        // If no rewards, do nothing (or show an alert)
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
        // Show a fun fact alert
        alert(getRandomItem(eccoFunFacts));
      }
  
      // 2) Update the button label or any UI element to reflect new count
      claimRewardBtn.textContent = rewardCount + " rewards Available";
  
      // 3) Just for fun, log or alert a “funny comment”
      console.log("Haha, you used a reward! Current rewardCount:", rewardCount);
    });
  }
  