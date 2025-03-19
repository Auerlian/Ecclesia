// ========== voting.js ==========

// Sample Data
const elections = [
    {
      id: 1,
      institution: "University Student Council",
      timeRemaining: "2 days 5 hrs",
      positionsCount: 2,
      reward: "Free Coffee Voucher",
      positions: [
        {
          id: 101,
          title: "President",
          info: "The President oversees all council operations.",
          moreInfoLink: "#",
          candidates: [
            {
              id: 1001,
              name: "Alice Johnson",
              image: "https://via.placeholder.com/150?text=Alice",
              manifesto: "Better campus facilities and student support.",
              aiSummary: "Focus on improved infrastructure and welfare.",
              social: { twitter: "#", linkedin: "#" },
              bestChoice: true
            },
            {
              id: 1002,
              name: "Bob Smith",
              image: "https://via.placeholder.com/150?text=Bob",
              manifesto: "Transparency and student empowerment.",
              aiSummary: "Emphasizes accountability and active participation.",
              social: { twitter: "#", linkedin: "#" },
              bestChoice: false
            }
          ],
          vote: null
        },
        {
          id: 102,
          title: "Vice President",
          info: "Supports the President and manages specific projects.",
          moreInfoLink: "#",
          candidates: [
            {
              id: 1003,
              name: "Carol White",
              image: "https://via.placeholder.com/150?text=Carol",
              manifesto: "Innovative projects for community engagement.",
              aiSummary: "Strong focus on community and innovation.",
              social: { twitter: "#", linkedin: "#" },
              bestChoice: false
            },
            {
              id: 1004,
              name: "David Lee",
              image: "https://via.placeholder.com/150?text=David",
              manifesto: "Commitment to student representation.",
              aiSummary: "Highlights dedication and representation.",
              social: { twitter: "#", linkedin: "#" },
              bestChoice: true
            }
          ],
          vote: null
        }
      ]
    }
    // Additional elections can be added here...
  ];
  
  // Global state for voting
  let currentElection = null;
  let currentPositionIndex = 0;
  let selectedCandidate = null;
  
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