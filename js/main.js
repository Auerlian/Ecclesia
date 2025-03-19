// ========== main.js ==========

// On DOM load, we might do some initialization.
document.addEventListener("DOMContentLoaded", () => {
    renderElectionList(); // calls the function from voting.js
  });
  
  // Switch between main "Voting" view and "Profile" view
  function showPrimaryView(viewId) {
    if (viewId === 'electionView') {
      showView('electionView');
    } else if (viewId === 'profileView') {
      showView('profileView');
    }
    document.getElementById("navVoting").classList.toggle("active", viewId === 'electionView');
    document.getElementById("navProfile").classList.toggle("active", viewId === 'profileView');
  }
  
  // Generic function to hide all .view elements and show the chosen one
  function showView(viewId) {
    document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");
  }