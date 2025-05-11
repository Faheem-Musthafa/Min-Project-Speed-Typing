// User profile data management
import { 
    getCurrentUser, 
    getUserProfile, 
    getTestHistory, 
    getFilteredTestHistory,
    isUserLoggedIn,
    onAuthChange
} from './firebase-config.js';

// Import shared Firebase configuration if needed directly
// import { auth, db } from '../firebase-shared.js';

// Default user data structure
let userData = {
    username: 'Guest',
    joinedDate: 'January 1, 2023',
    stats: {
        avgWpm: 0,
        avgAccuracy: 0,
        testsTaken: 0,
        bestWpm: 0
    },
    testHistory: []
};

// Load user data from Firebase or sessionStorage
async function loadUserData() {
    // First check session storage for user data
    const sessionUser = sessionStorage.getItem('user');
    
    if (sessionUser) {
        const userObj = JSON.parse(sessionUser);
        const userProfile = await getUserProfile(userObj.uid);
        
        if (userProfile) {
            userData = {
                username: userProfile.username || userProfile.firstName || userObj.email.split('@')[0],
                joinedDate: new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                stats: userProfile.stats || userData.stats,
                testHistory: await getTestHistory(userObj.uid) || []
            };
        }
    } else if (isUserLoggedIn()) {
        // Fallback to Firebase auth if session storage is empty
        const user = getCurrentUser();
        const userProfile = await getUserProfile(user.uid);
        
        if (userProfile) {
            userData = {
                username: userProfile.username || userProfile.firstName || user.email.split('@')[0],
                joinedDate: new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                stats: userProfile.stats || userData.stats,
                testHistory: await getTestHistory(user.uid) || []
            };
        }
    } else {
        // Fallback to localStorage for users not logged in
        const savedData = localStorage.getItem('monkeytype-user-data');
        if (savedData) {
            userData = JSON.parse(savedData);
        }
    }
    
    updateProfileUI();
    renderTestHistory();
    renderPerformanceChart();
}

// Update the profile UI with user data
function updateProfileUI() {
    document.getElementById('profile-username').textContent = userData.username;
    document.getElementById('profile-joined').innerHTML = `Joined: <span>${userData.joinedDate}</span>`;
    document.getElementById('avg-wpm').textContent = Math.round(userData.stats.avgWpm);
    document.getElementById('avg-accuracy').textContent = userData.stats.avgAccuracy + '%';
    document.getElementById('tests-taken').textContent = userData.stats.testsTaken;
    document.getElementById('best-wpm').textContent = Math.round(userData.stats.bestWpm);
}

// Render the test history table
async function renderTestHistory(filter = 'all') {
    const tableBody = document.getElementById('history-table-body');
    tableBody.innerHTML = '';
    
    // Show loading indicator
    const loadingRow = document.createElement('tr');
    loadingRow.innerHTML = `<td colspan="5" style="text-align: center;">Loading test history...</td>`;
    tableBody.appendChild(loadingRow);
    
    let filteredTests = [];
    
    // Get test history from Firebase if user is logged in
    if (isUserLoggedIn()) {
        const user = getCurrentUser();
        filteredTests = await getFilteredTestHistory(user.uid, filter);
    } else {
        // Fallback to localStorage for users not logged in
        filteredTests = userData.testHistory;
        if (filter !== 'all') {
            filteredTests = userData.testHistory.filter(test => test.timeSeconds === parseInt(filter));
        }
        
        // Sort by date (newest first)
        filteredTests.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Clear loading indicator
    tableBody.innerHTML = '';
    
    // Create table rows
    filteredTests.forEach(test => {
        const row = document.createElement('tr');
        
        // Format date
        const testDate = new Date(test.date || test.timestamp);
        const formattedDate = testDate.toLocaleDateString() + ' ' + 
                             testDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${Math.round(test.wpm)}</td>
            <td>${test.accuracy}%</td>
            <td>${test.timeSeconds}s</td>
            <td>${test.correctChars}/${test.totalChars}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show message if no tests
    if (filteredTests.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" style="text-align: center;">No test history available</td>`;
        tableBody.appendChild(row);
    }
}

// Render the performance chart
function renderPerformanceChart() {
    const ctx = document.getElementById('performance-chart').getContext('2d');
    
    // Get the last 10 tests
    const recentTests = [...userData.testHistory]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-10);
    
    // Prepare data for the chart
    const labels = recentTests.map(test => {
        const date = new Date(test.date);
        return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    });
    
    const wpmData = recentTests.map(test => test.wpm);
    const accuracyData = recentTests.map(test => test.accuracy);
    
    // Create the chart
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'WPM',
                    data: wpmData,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primaryColor'),
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'Accuracy %',
                    data: accuracyData,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'WPM'
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--sub-color') + '33'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    max: 100,
                    title: {
                        display: true,
                        text: 'Accuracy %'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                },
                x: {
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--sub-color') + '33'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            }
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set up authentication state listener
    onAuthChange(async (user) => {
        if (user) {
            console.log('User is logged in:', user.email);
            // Update UI for logged-in user
            document.querySelector('li a[href="../login_page/Login/login.html"]').textContent = 'Logout';
            document.querySelector('li a[href="../login_page/Login/login.html"]').addEventListener('click', (e) => {
                e.preventDefault();
                // Clear session storage
                sessionStorage.removeItem('user');
                
                logoutUser().then(() => {
                    window.location.href = '../login_page/Login/login.html';
                });
            });
        } else {
            console.log('User is not logged in');
            // Redirect to login if trying to access profile while not logged in
            if (window.location.pathname.includes('profile.html')) {
                alert('Please log in to view your profile');
                window.location.href = '../login_page/Login/login.html';
                return;
            }
        }
        
        // Load user data
        await loadUserData();
    });
    
    // Set up history filter buttons
    document.querySelectorAll('.history-filter').forEach(btn => {
        btn.addEventListener('click', async () => {
            // Update active button
            document.querySelectorAll('.history-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter history
            await renderTestHistory(btn.getAttribute('data-filter'));
        });
    });
});

// Import logout function
import { logoutUser } from './firebase-config.js';