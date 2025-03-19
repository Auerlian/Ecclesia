// ========== voting.js ==========
// We rely on electionData.js for generateRandomElections().

/**
 * If random data sets multiple "bestChoice" on the same position,
 * this function ensures only the first candidate remains marked as bestChoice.
 */
function fixStarCandidate(position) {
    let foundStar = false;
    position.candidates.forEach(c => {
      if (c.bestChoice) {
        if (!foundStar) {
          foundStar = true;
        } else {
          c.bestChoice = false;
        }
      }
    });
  }
  
  // ----------------------------------------------------
  // Generate and initialize elections
  // ----------------------------------------------------
  const elections = generateRandomElections(2);
  
  // We'll add a custom `locked = false` property to each election (not in your generator).
  // This tracks whether a user has "confirmed" their votes for that election.
  elections.forEach(e => {
    e.locked = false; 
    // Optionally fix star candidates for each position:
    e.positions.forEach(pos => fixStarCandidate(pos));
  });
  
  // Global state for voting
  let currentElection = null;
  let currentPositionIndex = 0;
  let selectedCandidate = null;
  let rewardCount = 0; // We increment this after each vote
  
  // ----------------------------------------------------
  // Core Rendering Logic
  // ----------------------------------------------------
  
  /**
   * Render the list of elections.
   */
  function renderElectionList() {
    const electionList = document.getElementById("electionList");
    if (!electionList) return;
  
    electionList.innerHTML = "";
  
    elections.forEach(election => {
      // Build a clickable block
      const block = document.createElement("div");
      block.className = "election-block";
      block.id = `election-block-${election.id}`;
      block.onclick = () => startElection(election.id);
  
      // We'll display a countdown in <span id="countdown-X">
      block.innerHTML = `
        <h2>${election.institution}</h2>
        <p><strong>Ends In:</strong> <span id="countdown-${election.id}"></span></p>
        <p><strong>Positions:</strong> ${election.positionsCount}</p>
      `;
      electionList.appendChild(block);
    });
  }
  
  /**
   * Start an election. If it's locked, go straight to a read-only review.
   */
  function startElection(electionId) {
    currentElection = elections.find(e => e.id === electionId);
    if (!currentElection) return;
  
    selectedCandidate = null;
  
    // If the election is already locked, jump to read-only review
    if (currentElection.locked) {
      showView("reviewView");
      renderReviewSummary(true); // read-only
      return;
    }
  
    // Otherwise, let them vote
    currentPositionIndex = 0;
    const titleElem = document.getElementById("positionElectionTitle");
    if (titleElem) {
      titleElem.textContent = currentElection.institution;
    }
  
    showView("positionView");
    renderCurrentPosition();
  }
  
  /**
   * Render the current position. If we've done them all, go to review.
   */
  function renderCurrentPosition() {
    const posContainer = document.getElementById("positionBlock");
    if (!posContainer) return;
  
    // If we've gone through all positions, show review
    if (currentPositionIndex >= currentElection.positions.length) {
      showView("reviewView");
      renderReviewSummary(false); // not locked yet
      return;
    }
  
    posContainer.innerHTML = "";
  
    const position = currentElection.positions[currentPositionIndex];
    const totalPositions = currentElection.positions.length;
    const currentPosNumber = currentPositionIndex + 1;
  
    // Top nav bar with back/next/close
    const navBar = `
      <div class="position-nav-top">
        <div style="display:flex; gap:10px;">
          <button class="btn small-btn" onclick="previousPosition()">Back</button>
          <button class="btn small-btn" onclick="nextPosition()">Next</button>
        </div>
        <div class="position-count">
          ${currentPosNumber}/${totalPositions}
        </div>
        <div>
          <button class="btn small-btn" onclick="exitElection()">✕</button>
        </div>
      </div>
    `;
  
    const posBlock = document.createElement("div");
    posBlock.className = "position-block";
    posBlock.innerHTML = `
      ${navBar}
      <div class="position-info">
        <h2>${position.title}</h2>
        <p>${position.info}</p>
        <a href="${position.moreInfoLink}" target="_blank">More Info</a>
      </div>
      <div class="candidates" id="candidatesContainer"></div>
    `;
  
    posContainer.appendChild(posBlock);
  
    // Now render the candidates
    renderCandidates(position.candidates);
  }
  
  /**
   * Move to the next position.
   */
  function nextPosition() {
    currentPositionIndex++;
    if (currentPositionIndex >= currentElection.positions.length) {
      showView("reviewView");
      renderReviewSummary(false);
    } else {
      renderCurrentPosition();
    }
  }
  
  /**
   * Move back to the previous position (if any).
   */
  function previousPosition() {
    if (currentPositionIndex > 0) {
      currentPositionIndex--;
      renderCurrentPosition();
    } else {
      exitElection();
    }
  }
  
  /**
   * Render the candidates for the current position.
   */
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
  
  // ----------------------------------------------------
  // Candidate Panel Overlay
  // ----------------------------------------------------
  
  function openCandidatePanel(candidate) {
    selectedCandidate = candidate;
  
    // Fill overlay
    const candidateImageElem = document.getElementById("candidateImage");
    const candidateNameElem = document.getElementById("candidateName");
    const candidateManifestoElem = document.getElementById("candidateManifesto");
    const candidateAISummaryElem = document.getElementById("candidateAISummary");
    const socialDiv = document.getElementById("candidateSocial");
  
    if (candidateImageElem)   candidateImageElem.src = candidate.image;
    if (candidateNameElem)    candidateNameElem.textContent = candidate.name;
    if (candidateManifestoElem)   candidateManifestoElem.textContent = candidate.manifesto;
    if (candidateAISummaryElem)   candidateAISummaryElem.textContent = candidate.aiSummary;
    
    if (socialDiv) {
      socialDiv.innerHTML = "";
      for (const [platform, link] of Object.entries(candidate.social)) {
        const anchor = document.createElement("a");
        anchor.href = link;
        anchor.target = "_blank";
        anchor.textContent = platform;
        socialDiv.appendChild(anchor);
      }
    }
  
    // Show overlay
    const candidateOverlay = document.getElementById("candidateOverlay");
    if (candidateOverlay) {
      candidateOverlay.classList.add("active");
    }
  }
  
  function closeCandidatePanel() {
    const candidateOverlay = document.getElementById("candidateOverlay");
    if (candidateOverlay) {
      candidateOverlay.classList.remove("active");
    }
    selectedCandidate = null;
  }
  
  /**
   * Vote for the selected candidate => immediate reward => next position.
   */
  function voteForCandidate() {
    if (!currentElection) return;
  
    // Mark the vote
    const position = currentElection.positions[currentPositionIndex];
    position.vote = selectedCandidate;
  
    closeCandidatePanel();
  
    // Increment reward
    rewardCount++;
    updateRewardDisplays();
  
    // Animate the reward overlay
    const rewardPanel = document.querySelector(".reward-panel");
    if (rewardPanel) {
      rewardPanel.classList.remove("animate");
      void rewardPanel.offsetWidth; // reflow trick
      rewardPanel.classList.add("animate");
    }
  
    // Show reward overlay
    const rewardOverlay = document.getElementById("rewardOverlay");
    if (rewardOverlay) {
      rewardOverlay.classList.add("active");
    }
  }
  
  function rewardConfirmed() {
    const rewardOverlay = document.getElementById("rewardOverlay");
    if (rewardOverlay) {
      rewardOverlay.classList.remove("active");
    }
    nextPosition();
  }
  
  // ----------------------------------------------------
  // Election Review
  // ----------------------------------------------------
  
  /**
   * Render the review summary. If locked=true => read-only (no Back/Cancel/Confirm).
   */
  function renderReviewSummary(locked) {
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
  
    // If locked => show only "Back to Elections" button
    if (locked) {
      const finishBtn = document.createElement("button");
      finishBtn.className = "btn";
      finishBtn.textContent = "Back to Elections";
      finishBtn.onclick = backToElections;
      reviewContainer.appendChild(finishBtn);
      return;
    }
  
    // Otherwise, show the 3-button approach
    const btnContainer = document.createElement("div");
    btnContainer.style.marginTop = "20px";
  
    // Back => last position
    const backBtn = document.createElement("button");
    backBtn.className = "btn";
    backBtn.textContent = "Back";
    backBtn.onclick = () => {
      // Jump to the last position
      currentPositionIndex = currentElection.positions.length - 1;
      showView("positionView");
      renderCurrentPosition();
    };
    btnContainer.appendChild(backBtn);
  
    // Cancel => back to election list
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn";
    cancelBtn.style.marginLeft = "10px";
    cancelBtn.textContent = "Cancel";
    cancelBtn.onclick = backToElections;
    btnContainer.appendChild(cancelBtn);
  
    // Confirm => lock election
    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn";
    confirmBtn.style.marginLeft = "10px";
    confirmBtn.textContent = "Confirm (Lock Votes)";
    confirmBtn.onclick = confirmElection;
    btnContainer.appendChild(confirmBtn);
  
    reviewContainer.appendChild(btnContainer);
  }
  
  /**
   * Confirm => lock the current election so it can't be edited again.
   */
  function confirmElection() {
    if (!currentElection) return;
    currentElection.locked = true;
    alert("Your votes are locked. You can no longer edit this election.");
    backToElections();
  }
  
  // ----------------------------------------------------
  // Navigation Helpers
  // ----------------------------------------------------
  
  function exitElection() {
    alert("Exiting election. Your progress has been saved.");
    showView("electionView");
  }
  
  function backToElections() {
    currentElection = null;
    currentPositionIndex = 0;
    selectedCandidate = null;
    showView("electionView");
  }
  
  /**
   * Show/hide different "view" sections by ID
   */
  function showView(viewId) {
    const views = document.querySelectorAll(".view");
    views.forEach(v => v.classList.remove("active"));
  
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add("active");
    }
  }
  
  // If you have bottom navigation that toggles active buttons:
  function showPrimaryView(viewId) {
    document.getElementById("navVoting")?.classList.remove("active");
    document.getElementById("navProfile")?.classList.remove("active");
  
    if (viewId === "profileView") {
      document.getElementById("navProfile")?.classList.add("active");
    } else {
      document.getElementById("navVoting")?.classList.add("active");
    }
    showView(viewId);
  }
  
  // ----------------------------------------------------
  // Live Countdown (updates each second)
  // ----------------------------------------------------
  
  /**
   * Update the "Ends In:" countdown for each election.
   */
  function updateCountdowns() {
    const now = Date.now();
    elections.forEach(election => {
      const countdownEl = document.getElementById(`countdown-${election.id}`);
      if (!countdownEl) return;
  
      const diff = election.endTime.getTime() - now;
      if (diff <= 0) {
        countdownEl.textContent = "Ended";
      } else {
        const totalSec = Math.floor(diff / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        countdownEl.textContent =
          String(hours).padStart(2, "0") + ":" +
          String(mins).padStart(2, "0") + ":" +
          String(secs).padStart(2, "0");
      }
    });
  }
  
  // ----------------------------------------------------
  // Reward Display / Profile Badge
  // ----------------------------------------------------
  
  /**
   * Update both the "Claim Reward" button text and the profile badge 
   * to reflect the current rewardCount.
   */
  function updateRewardDisplays() {
    // "Claim Reward" button
    const rewardBtn = document.getElementById("claim_reward");
    if (rewardBtn) {
      rewardBtn.textContent = rewardCount + " rewards Available";
    }
    // Badge on the Profile nav button
    const badge = document.getElementById("profileBadge");
    if (badge) {
      if (rewardCount > 0) {
        badge.textContent = rewardCount;
        badge.style.display = "inline-block";
      } else {
        badge.textContent = "";
        badge.style.display = "none";
      }
    }
  }
  
  // ----------------------------------------------------
  // Initialization on page load
  // ----------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // 1) Render the election list
    renderElectionList();
    // 2) Show the initial reward counts
    updateRewardDisplays();
    // 3) Start the countdown timer
    setInterval(updateCountdowns, 1000);
  });
  