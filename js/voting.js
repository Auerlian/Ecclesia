// ========== voting.js ==========

// Example random elections. We'll include a random endTime about 2h from now.
function generateRandomElections(count) {
    const elections = [];
    for (let i = 1; i <= count; i++) {
      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in ms
      const randomEndTime = now + twoHours + Math.floor(Math.random() * 30000); // 0-30s variance
  
      elections.push({
        id: i,
        institution: `Institution ${i}`,
        positionsCount: 3, // for example
        locked: false,     // new: not locked initially
        endTime: randomEndTime, // store ms since epoch
  
        // Example positions data
        positions: [
          {
            title: "President",
            info: "Vote for the next President.",
            moreInfoLink: "#",
            candidates: [
              // ... sample
              { name: "Alice", image: "images/alice.png", manifesto: "Alice's manifesto", aiSummary: "AI summary for Alice", social: {}, bestChoice: false },
              { name: "Bob",   image: "images/bob.png",   manifesto: "Bob's manifesto",   aiSummary: "AI summary for Bob",   social: {}, bestChoice: true },
            ]
          },
          {
            title: "Secretary",
            info: "Vote for the Secretary.",
            moreInfoLink: "#",
            candidates: [
              { name: "Charlie", image: "images/charlie.png", manifesto: "", aiSummary: "", social: {}, bestChoice: false },
              { name: "Dana",    image: "images/dana.png",    manifesto: "", aiSummary: "", social: {}, bestChoice: false },
            ]
          },
          {
            title: "Treasurer",
            info: "Vote for the Treasurer.",
            moreInfoLink: "#",
            candidates: [
              { name: "Eve",   image: "images/eve.png",   manifesto: "", aiSummary: "", social: {}, bestChoice: false },
              { name: "Frank", image: "images/frank.png", manifesto: "", aiSummary: "", social: {}, bestChoice: false },
            ]
          }
        ]
      });
    }
    return elections;
  }
  
  const elections = generateRandomElections(3);
  
  // ----------------------------------------------------
  // Global state for voting
  // ----------------------------------------------------
  let currentElection = null;
  let currentPositionIndex = 0;
  let selectedCandidate = null;
  let rewardCount = 0; // We'll increment after each vote
  
  /**
   * If random data sets multiple "bestChoice", keep only the first for each position.
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
  
  // 1) Render the election list (with placeholders for live countdown)
  function renderElectionList() {
    const electionList = document.getElementById("electionList");
    if (!electionList) return;
  
    electionList.innerHTML = "";
  
    elections.forEach(election => {
      // Ensure only 1 star candidate per position
      election.positions.forEach(pos => fixStarCandidate(pos));
  
      const block = document.createElement("div");
      block.className = "election-block";
      block.id = `election-block-${election.id}`;
      block.onclick = () => startElection(election.id);
  
      block.innerHTML = `
        <h2>${election.institution}</h2>
        <p><strong>Ends In:</strong> <span id="countdown-${election.id}"></span></p>
        <p><strong>Positions:</strong> ${election.positionsCount}</p>
      `;
      electionList.appendChild(block);
    });
  }
  
  // 2) Start an election
  function startElection(electionId) {
    currentElection = elections.find(e => e.id === electionId);
    selectedCandidate = null;
  
    // If the election is locked, skip directly to the read-only review
    if (currentElection.locked) {
      showView("reviewView");
      renderReviewSummary(true);  // pass a flag that it's locked
      return;
    }
  
    // Otherwise, let the user pick positions
    currentPositionIndex = 0;
    document.getElementById("positionElectionTitle").textContent =
      currentElection.institution;
  
    showView("positionView");
    renderCurrentPosition();
  }
  
  // 3) Show the current position
  function renderCurrentPosition() {
    const posContainer = document.getElementById("positionBlock");
    if (!posContainer) return;
  
    // If we've gone through all positions, show summary
    if (currentPositionIndex >= currentElection.positions.length) {
      showView("reviewView");
      renderReviewSummary(false); // not locked yet
      return;
    }
  
    posContainer.innerHTML = "";
  
    const position = currentElection.positions[currentPositionIndex];
    const totalPositions = currentElection.positions.length;
    const currentPosNumber = currentPositionIndex + 1;
  
    // Build a top nav with "Back" + "Next" and a "Close" (✕)
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
  
    renderCandidates(position.candidates);
  }
  
  // 3a) Next position
  function nextPosition() {
    currentPositionIndex++;
    if (currentPositionIndex >= currentElection.positions.length) {
      showView("reviewView");
      renderReviewSummary(false); // not locked
    } else {
      renderCurrentPosition();
    }
  }
  
  // 3b) Previous position
  function previousPosition() {
    if (currentPositionIndex > 0) {
      currentPositionIndex--;
      renderCurrentPosition();
    } else {
      exitElection();
    }
  }
  
  // 4) Render candidates
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
  
  // 5) Open candidate panel
  function openCandidatePanel(candidate) {
    selectedCandidate = candidate;
  
    // Fill overlay
    document.getElementById("candidateImage").src = candidate.image;
    document.getElementById("candidateName").textContent = candidate.name;
    document.getElementById("candidateManifesto").textContent = candidate.manifesto;
    document.getElementById("candidateAISummary").textContent = candidate.aiSummary;
  
    // Social links
    const socialDiv = document.getElementById("candidateSocial");
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
  
    document.getElementById("candidateOverlay").classList.add("active");
  }
  
  // Close candidate overlay
  function closeCandidatePanel() {
    document.getElementById("candidateOverlay").classList.remove("active");
    selectedCandidate = null;
  }
  
  // 6) Immediately vote => increment reward => show reward overlay
  function voteForCandidate() {
    if (!currentElection) return;
  
    const position = currentElection.positions[currentPositionIndex];
    position.vote = selectedCandidate;
  
    // Close the candidate panel
    closeCandidatePanel();
  
    // Immediately increment the reward
    rewardCount++;
  
    // Update the reward button & badge in Profile
    updateRewardDisplays();
  
    // Animate the reward overlay
    const rewardPanel = document.querySelector(".reward-panel");
    if (rewardPanel) {
      // Restart the "celebratePop" animation
      rewardPanel.classList.remove("animate");
      void rewardPanel.offsetWidth; // trick to reflow
      rewardPanel.classList.add("animate");
    }
  
    // Show the overlay
    document.getElementById("rewardOverlay").classList.add("active");
  }
  
  // 6a) After user sees the overlay, proceed
  function rewardConfirmed() {
    document.getElementById("rewardOverlay").classList.remove("active");
    nextPosition();
  }
  
  // 7) Exit election
  function exitElection() {
    alert("Exiting election. Your progress has been saved.");
    showView("electionView");
  }
  
  // 8) Show summary
  //    locked param: if true => read-only summary (no back/cancel/confirm)
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
  
    // If locked => only show "Return to Elections"
    if (locked) {
      const finishBtn = document.createElement("button");
      finishBtn.className = "btn";
      finishBtn.textContent = "Back to Elections";
      finishBtn.onclick = backToElections;
      reviewContainer.appendChild(finishBtn);
      return; // no other buttons
    }
  
    // Otherwise, show the 3-button approach (Back, Cancel, Confirm)
    const btnContainer = document.createElement("div");
    btnContainer.style.marginTop = "20px";
  
    // 8a) Back
    const backBtn = document.createElement("button");
    backBtn.className = "btn";
    backBtn.textContent = "Back";
    backBtn.onclick = () => {
      // go to the last position
      currentPositionIndex = currentElection.positions.length - 1;
      showView("positionView");
      renderCurrentPosition();
    };
    btnContainer.appendChild(backBtn);
  
    // 8b) Cancel
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.marginLeft = "10px";
    cancelBtn.onclick = backToElections;
    btnContainer.appendChild(cancelBtn);
  
    // 8c) Confirm
    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn";
    confirmBtn.textContent = "Confirm (Lock Votes)";
    confirmBtn.style.marginLeft = "10px";
    confirmBtn.onclick = confirmElection;
    btnContainer.appendChild(confirmBtn);
  
    reviewContainer.appendChild(btnContainer);
  }
  
  // 8d) Confirm the election (lock it so no more editing)
  function confirmElection() {
    if (!currentElection) return;
    currentElection.locked = true;
    // Return to the main elections list
    alert("Your votes are locked. You can no longer edit this election.");
    backToElections();
  }
  
  // 9) Back to main
  function backToElections() {
    currentElection = null;
    currentPositionIndex = 0;
    selectedCandidate = null;
    showView("electionView");
  }
  
  // 10) Live countdown: every second, update each election's countdown
  function updateCountdowns() {
    const now = Date.now();
    elections.forEach(e => {
      const countdownEl = document.getElementById(`countdown-${e.id}`);
      if (!countdownEl) return;
  
      const diff = e.endTime - now;
      if (diff <= 0) {
        countdownEl.textContent = "Ended";
      } else {
        // Convert diff ms -> HH:MM:SS
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
  
  // Helper: update both the "claim_reward" button text and the profile badge
  function updateRewardDisplays() {
    // 1) The "Claim Reward" button
    const rewardBtn = document.getElementById("claim_reward");
    if (rewardBtn) {
      rewardBtn.textContent = rewardCount + " rewards Available";
    }
  
    // 2) The badge on the Profile nav button
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
  
  // On page load, show the election list, start the countdown
  document.addEventListener("DOMContentLoaded", () => {
    renderElectionList();
    updateRewardDisplays();
  
    // Update every second
    setInterval(updateCountdowns, 1000);
  });
  