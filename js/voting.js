// ========== voting.js ==========

// Example: 3 random elections from your random generator
const elections = generateRandomElections(3);

// ----------------------------------------------------
// Global state for voting
// ----------------------------------------------------
let currentElection = null;
let currentPositionIndex = 0;
let selectedCandidate = null;
let rewardCount = 0; // We'll increment this after each vote

/**
 * If your random data might mark multiple "bestChoice" candidates,
 * this ensures only the first one remains star-marked.
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

// 1) Render the election list
function renderElectionList() {
  const electionList = document.getElementById("electionList");
  if (!electionList) return;

  electionList.innerHTML = "";

  elections.forEach(election => {
    // Ensure only 1 star candidate per position
    election.positions.forEach(pos => fixStarCandidate(pos));

    const block = document.createElement("div");
    block.className = "election-block";
    block.onclick = () => startElection(election.id);

    // For demo, show a sample end date/time
    const endsOn = new Date();
    endsOn.setHours(endsOn.getHours() + 2); // e.g. ends 2h from now

    block.innerHTML = `
      <h2>${election.institution}</h2>
      <p><strong>Ends On:</strong> ${endsOn.toLocaleString()}</p>
      <p><strong>Positions:</strong> ${election.positionsCount}</p>
    `;
    electionList.appendChild(block);
  });
}

// 2) Start an election
function startElection(electionId) {
  currentElection = elections.find(e => e.id === electionId);
  currentPositionIndex = 0;
  selectedCandidate = null;

  document.getElementById("positionElectionTitle").textContent =
    currentElection.institution;

  showView("positionView");
  renderCurrentPosition();
}

// 3) Render the current position
function renderCurrentPosition() {
  const posContainer = document.getElementById("positionBlock");
  if (!posContainer) return;

  // If we've gone through all positions, show summary
  if (currentPositionIndex >= currentElection.positions.length) {
    renderReviewSummary();
    showView("reviewView");
    return;
  }

  posContainer.innerHTML = "";

  const position = currentElection.positions[currentPositionIndex];

  // Top Nav with Back, Next, and Close
  const navBar = `
    <div class="position-nav-top">
      <button class="btn small-btn" onclick="previousPosition()">Back</button>
      <button class="btn small-btn" onclick="nextPosition()">Next</button>
      <button class="btn small-btn" onclick="exitElection()">Close</button>
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
    renderReviewSummary();
    showView("reviewView");
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

  closeCandidatePanel();

  // Immediately increment the reward
  rewardCount++;

  // Update the reward button text in the Profile view
  const rewardBtn = document.getElementById("claim_reward");
  if (rewardBtn) {
    rewardBtn.textContent = rewardCount + " rewards Available";
  }

  // Show the reward overlay
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

  // "Done" or "Back to Elections" button
  const finishBtn = document.createElement("button");
  finishBtn.className = "btn";
  finishBtn.textContent = "Back to Elections";
  finishBtn.onclick = backToElections;
  reviewContainer.appendChild(finishBtn);
}

// 9) Back to main
function backToElections() {
  currentElection = null;
  currentPositionIndex = 0;
  selectedCandidate = null;
  showView("electionView");
}

// Helper to show/hide views
function showView(viewId) {
  const views = document.querySelectorAll(".view");
  views.forEach(v => v.classList.remove("active"));

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
  }
}

// On page load, show the election list
document.addEventListener("DOMContentLoaded", () => {
  renderElectionList();
});
