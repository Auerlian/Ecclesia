// ========== electionData.js ==========

/**
 * Returns a random element from an array.
 */
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  function generateCandidate(candidateId) {
    const firstNames = ["Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Holly"];
    const lastNames = ["Johnson", "Smith", "White", "Lee", "Brown", "Miller", "Davis"];
    const manifestos = [
      "Improving student life through better facilities.",
      "A focus on transparency and accountability.",
      "More community engagement and innovation.",
      "Commitment to student representation and events."
    ];
  
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
  
    return {
      id: candidateId,
      name: `${firstName} ${lastName}`,
      image: "images/eccos/ecco_hair.png",
      manifesto: getRandomElement(manifestos),
      aiSummary: "Automatically generated summary about the candidate's platform.",
      social: {
        twitter: "#",
        linkedin: "#"
      },
      // Randomly mark 1 out of 4 candidates as a "bestChoice"
      bestChoice: Math.random() < 0.25
    };
  }
  
  /**
   * Generates a random position with 2–8 candidates.
   */
  function generatePosition(positionId, titleIndex) {
    const positionTitles = [
      "President",
      "Vice President",
      "Secretary",
      "Treasurer",
      "Public Relations Officer",
      "Events Coordinator",
      "Sports Director",
      "Welfare Officer"
    ];
  
    // Make sure we stay in range for positionTitles
    const title = positionTitles[titleIndex % positionTitles.length] || "Position " + positionId;
    const candidateCount = Math.floor(Math.random() * 7) + 2; // 2–8
    const candidates = [];
  
    for (let i = 0; i < candidateCount; i++) {
      const candidateId = positionId * 100 + i + 1; // e.g. 10101
      candidates.push(generateCandidate(candidateId));
    }
  
    return {
      id: positionId,
      title: title,
      info: `Information about the role of ${title}.`,
      moreInfoLink: "#",
      candidates: candidates,
      vote: null
    };
  }
  
  /**
   * Generates a single election object with 4–12 positions.
   */
  function generateElection(electionId) {
    const institutions = ["UoB Student Council", "Debating Society"];
    const randomInstitution = getRandomElement(institutions);
  
    // random positions 4–12
    const positionsCount = Math.floor(Math.random() * 9) + 4;
    const positions = [];
  
    for (let i = 0; i < positionsCount; i++) {
      const positionId = electionId * 100 + i + 1; // e.g. 101, 102
      positions.push(generatePosition(positionId, i));
    }
  
    const rewards = ["Ecco Upgrades"];
    const now = Date.now();
    const randomOffset = Math.floor(Math.random() * 50) + 1; // 1–5 minutes
    const endTime = new Date(now + randomOffset * 600_000);
    
    return {
        id: electionId,
        institution: randomInstitution + " #" + electionId,
        endTime, // store it
        positionsCount: positionsCount,
        positions: positions
    };
  }
  
  function generateRandomElections(count = 1) {
    const elections = [];
    for (let i = 1; i <= count; i++) {
      elections.push(generateElection(i));
    }
    return elections;
  }
  