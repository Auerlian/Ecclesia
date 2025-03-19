// ========== voting.js ==========

// 1) Generate your random data from the separate script electionData.js
const elections = generateRandomElections(3);

// ----------------------------------------------------
// Global state for voting
// ----------------------------------------------------
let currentElection = null;
let currentPositionIndex = 0;
let selectedCandidate = null;

// NEW GLOBAL VARIABLE FOR REWARDS
let rewardCount = 0;

/**
 * Ensure only one star candidate per position (in case your random data
 * sets multiple bestChoice = true).
 */
function fixStarCandidate(position) {
  let starFound = false;
  position.candidates.forEach(candidate => {
    if (candidate.bestChoice) {
      if (!starFound) {
        // The first bestChoice we find, keep it
        starFound = true;
      } else {
        // Any subsequent bestChoice is reset
        candidate.bestChoice = false;
      }
    }
  });
}

// Render the election list inside #electionList
function renderElectionList() {
  const electionList = document.getElementById("electionList");
  if (!electionList) return; // safety check
  electionList.innerHTML = "";

  elections.forEach(election => {
    // 1) Fix star candidates in each position
    election.positions.forEach(pos => fixStarCandidate(pos));

    // Create a container for the countdown & institution
    const block = document.createElement("div");
    block.className = "election-block fancy-elex-block";

    // We'll inject a <span> to hold a live countdown
    const countdownId = "countdown_" + election.id; // unique ID

    block.innerHTML = `
      <h2>${election.institution}</h2>
      <p>
        <strong>Ends In:</strong> 
        <span id="${countdownId}">Loading...</span>
      </p>
      <p><strong>Positions:</strong> ${election.positionsCount}</p>
    `;

    // Clicking the block starts the election
    block.onclick = () => startElection(election.id);

    electionList.appendChild(block);

    // Kick off a live countdown timer for this election
    startCountdown(election.endTime, countdownId);
  });
}

/**
 * Live countdown utility.
 * endTime: a JS Date object
 * countdownId: the element ID where we update the timer display
 */
function startCountdown(endTime, countdownId) {
  function update() {
    const now = new Date().getTime();
    const distance = endTime.getTime() - now;

    if (distance <= 0) {
      document.getElementById(countdownId).textContent = "Election Ended";
      clearInterval(timer);
      return;
    }
    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Format: "3h 12m 9s"
    document.getElementById(countdownId).textContent =
      hours + "h " + minutes + "m " + seconds + "s";
  }
  update(); // run once immediately
  const timer = setInterval(update, 1000);
}

function startElection(electionId) {
  // Find the selected election object
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

  // If we've gone through all positions, show review
  if (currentPositionIndex >= currentElection.positions.length) {
    renderReviewSummary();
    showView("reviewView");
    return;
  }

  // Render the current position
  const position = currentElection.positions[currentPositionIndex];

  // 2) Move skip/exit/next/back to the top:
  const navBar = `
    <div class="position-nav-top">
      <button class="btn small-btn" onclick="skipPosition()">Skip</button>
      <button class="btn small-btn" onclick="exitElection()">Exit</button>
    </div>
  `;

  // For a "Next" button, we skip the "Confirm" approach. We'll handle that at the end.
  // We'll just show the candidates below. Once user picks one, we jump to next.

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

function renderCandidates(candidates) {
  const container = document.getElementById("candidatesContainer");
  if (!container) return;
  container.innerHTML = "";

  candidates.forEach(candidate => {
    const candidateDiv = document.createElement("div");
    candidateDiv.className = "candidate-block";
    // When a candidate is clicked, open the candidate panel
    candidateDiv.onclick = () => openCandidatePanel(candidate);
    candidateDiv.innerHTML = `
      <img src="${candidate.image}" alt="${candidate.name}">
      <p>${candidate.name}</p>
      ${candidate.bestChoice ? '<div class="best-choice">★</div>' : ""}
    `;
    container.appendChild(candidateDiv);
  });
}

// Candidate Panel: #4 - make it more interesting visually
function openCandidatePanel(candidate) {
  selectedCandidate = candidate;

  // Fill panel data
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
      anchor.textContent = platform;
      anchor.target = "_blank";
      socialDiv.appendChild(anchor);
    }
  }

  // Show overlay
  document.getElementById("candidateOverlay").classList.add("active");
}

// #4: You can also style the candidate panel with CSS, e.g. a gradient background, bigger headings, etc.
function closeCandidatePanel() {
  document.getElementById("candidateOverlay").classList.remove("active");
}

// #5: Voting goes directly to the next position. No per-candidate confirmation.
function voteForCandidate() {
  // Assign the selected candidate to this position
  const position = currentElection.positions[currentPositionIndex];
  position.vote = selectedCandidate;

  // Immediately close the panel and move to next position
  closeCandidatePanel();

  currentPositionIndex++;
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

// Review Summary: at the end, user sees all choices
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

  // Add a final 'Confirm All' button
  const confirmBtn = document.createElement("button");
  confirmBtn.className = "btn";
  confirmBtn.textContent = "Confirm All Votes";
  confirmBtn.onclick = confirmAllVotes;

  reviewContainer.appendChild(confirmBtn);

  // Also, a back-to-elections or re-visit button, if desired
  const backBtn = document.createElement("button");
  backBtn.className = "btn";
  backBtn.style.marginLeft = "10px";
  backBtn.textContent = "Back to Elections";
  backBtn.onclick = backToElections;
  reviewContainer.appendChild(backBtn);
}

/**
 * #5: The user confirms all votes at once here.
 * e.g. we can increment rewardCount for each vote, show a single overlay, etc.
 */
function confirmAllVotes() {
  let votesEarned = 0;
  currentElection.positions.forEach(pos => {
    if (pos.vote && typeof pos.vote === "object") {
      votesEarned++;
    }
  });

  // For example, add 1 reward per valid vote
  rewardCount += votesEarned;

  alert(`All votes confirmed! You selected ${votesEarned} candidates. 
You now have ${rewardCount} total reward(s).`);

  // Return to electionView or anywhere you want
  backToElections();
}

function backToElections() {
  currentElection = null;
  currentPositionIndex = 0;
  selectedCandidate = null;
  showView("electionView");
}

/** Example of a function that toggles views by ID. 
 *  Make sure each main section has class="view" and
 *  the matching ID (e.g. <div id="electionView" class="view">, etc.).
 */
function showView(viewId) {
  // Hide all .view elements
  const views = document.querySelectorAll(".view");
  views.forEach(view => view.classList.remove("active"));

  // Show the chosen one
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
  }
}

// Call renderElectionList() once the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  renderElectionList();
});