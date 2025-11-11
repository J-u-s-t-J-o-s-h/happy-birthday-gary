/* ========================================
   HAPPY BIRTHDAY CARY - MAIN APPLICATION
   Handles UI interactions, Firebase operations,
   and real-time message feed
   ======================================== */

// Import Firebase
import { database, storage, ref, push, onChildAdded, query, orderByChild, storageRef, uploadBytesResumable, getDownloadURL } from './firebase-config.js';

// Global variables
let messagesRef;
let polaroidQueue = [];
let isDropping = false;
let droppedCount = 0;
let allMediaItems = []; // Store all media items for preview
let currentPreviewIndex = 0;

/* ========================================
   INITIALIZATION
   ======================================== */

function initializeApp() {
    console.log("🎉 Initializing Birthday App...");
    
    // Create reference to messages in database
    messagesRef = ref(database, 'messages');
    
    // Set up UI event listeners
    initializeEventListeners();
    
    // Start listening for new messages
    listenForMessages();
    
    // Start confetti animation
    startConfetti();
    
    console.log("✅ App initialized successfully!");
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

/* ========================================
   EVENT LISTENERS
   ======================================== */

function initializeEventListeners() {
    // Birthday title confetti trigger
    const birthdayTitle = document.getElementById('birthdayTitle');
    birthdayTitle.addEventListener('click', () => {
        // Trigger a big celebratory confetti burst!
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.4 }
        });
        // Add a fun scale animation
        birthdayTitle.style.transform = 'scale(1.05)';
        setTimeout(() => {
            birthdayTitle.style.transform = '';
        }, 200);
    });
    
    // Modal controls
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const messageModal = document.getElementById('messageModal');
    const messageForm = document.getElementById('messageForm');
    
    // Open modal
    openModalBtn.addEventListener('click', () => {
        messageModal.classList.add('active');
        // Trigger confetti when opening modal
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
        });
    });
    
    // Close modal
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    messageModal.addEventListener('click', (e) => {
        if (e.target === messageModal) {
            closeModal();
        }
    });
    
    // Handle form submission
    messageForm.addEventListener('submit', handleFormSubmit);
    
    // Media preview modal controls
    const mediaPreviewModal = document.getElementById('mediaPreviewModal');
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const downloadMediaBtn = document.getElementById('downloadMediaBtn');
    const prevMediaBtn = document.getElementById('prevMediaBtn');
    const nextMediaBtn = document.getElementById('nextMediaBtn');
    const previewOverlay = document.querySelector('.media-preview-overlay');
    
    closePreviewBtn.addEventListener('click', closeMediaPreview);
    downloadMediaBtn.addEventListener('click', downloadCurrentMedia);
    previewOverlay.addEventListener('click', closeMediaPreview);
    
    prevMediaBtn.addEventListener('click', () => navigatePreview(-1));
    nextMediaBtn.addEventListener('click', () => navigatePreview(1));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (mediaPreviewModal.classList.contains('active')) {
            if (e.key === 'Escape') closeMediaPreview();
            if (e.key === 'ArrowLeft') navigatePreview(-1);
            if (e.key === 'ArrowRight') navigatePreview(1);
        }
    });
}

function closeModal() {
    const messageModal = document.getElementById('messageModal');
    messageModal.classList.remove('active');
    
    // Reset form
    document.getElementById('messageForm').reset();
    
    // Hide progress bar
    const uploadProgress = document.getElementById('uploadProgress');
    uploadProgress.classList.add('hidden');
}

/* ========================================
   FORM SUBMISSION & FIREBASE UPLOAD
   ======================================== */

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const nameInput = document.getElementById('nameInput');
    const messageInput = document.getElementById('messageInput');
    const fileInput = document.getElementById('fileInput');
    const submitBtn = document.getElementById('submitBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    // Validate inputs
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const file = fileInput.files[0];
    
    if (!name || !message) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = '📤 Sending...';
    
    try {
        let mediaUrl = null;
        let mediaType = null;
        
        // If file is selected, upload it first
        if (file) {
            // Validate file size (100MB max)
            if (file.size > 100 * 1024 * 1024) {
                throw new Error('File size must be less than 100MB');
            }
            
            // Show upload progress
            uploadProgress.classList.remove('hidden');
            
            // Upload file to Firebase Storage
            const uploadResult = await uploadFile(file, (progress) => {
                // Update progress bar
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `Uploading: ${Math.round(progress)}%`;
            });
            
            mediaUrl = uploadResult.url;
            mediaType = uploadResult.type;
            
            progressText.textContent = 'Upload complete! ✅';
        }
        
        // Save message to Realtime Database
        const messageData = {
            name: name,
            message: message,
            mediaUrl: mediaUrl,
            mediaType: mediaType,
            timestamp: Date.now()
        };
        
        await push(messagesRef, messageData);
        
        // Success!
        showToast('🎉 Birthday wishes sent successfully!', 'success');
        
        // Trigger celebration confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        
        // Close modal
        closeModal();
        
    } catch (error) {
        console.error('Error submitting message:', error);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = '🎈 Send Birthday Wishes 🎈';
    }
}

/* ========================================
   FIREBASE STORAGE UPLOAD
   ======================================== */

async function uploadFile(file, onProgress) {
    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const filepath = `birthday-media/${filename}`;
    
    // Create storage reference
    const fileRef = storageRef(storage, filepath);
    
    // Start upload
    const uploadTask = uploadBytesResumable(fileRef, file);
    
    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                // Progress callback
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                // Error callback
                reject(error);
            },
            async () => {
                // Success callback
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
                    resolve({ url: downloadURL, type: mediaType });
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

/* ========================================
   REAL-TIME MESSAGE FEED
   ======================================== */

function listenForMessages() {
    const polaroidZone = document.getElementById('polaroidZone');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Query messages ordered by timestamp
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    
    let isFirstLoad = true;
    let messageCount = 0;
    
    // Listen for new messages
    onChildAdded(messagesQuery, (snapshot) => {
        const messageData = snapshot.val();
        messageCount++;
        
        // Remove loading indicator on first message
        if (isFirstLoad && loadingIndicator) {
            loadingIndicator.remove();
            isFirstLoad = false;
        }
        
        // Add to polaroid queue
        addToPolaroidQueue(messageData);
    });
    
    // After 2 seconds, if no messages, show empty state
    setTimeout(() => {
        if (messageCount === 0 && loadingIndicator) {
            loadingIndicator.innerHTML = `
                <div class="text-center py-12" style="position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 4; width: 100%; max-width: 600px;">
                    <span style="font-size: 4rem;">🎂</span>
                    <p class="mt-4 text-xl font-bold" style="color: #8B6F47; text-shadow: 1px 1px 2px rgba(255,255,255,0.8), -1px -1px 1px rgba(0,0,0,0.2);">Be the first to wish Cary a happy birthday!</p>
                </div>
            `;
        }
    }, 2000);
}

/* ========================================
   POLAROID CARD CREATION
   ======================================== */

function createPolaroidCard(data) {
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    
    // Store ALL items for preview (with or without media)
    const itemIndex = allMediaItems.length;
    allMediaItems.push(data);
    
    let photoHTML = '';
    
    if (data.mediaUrl) {
        // Has media - make it clickable
        if (data.mediaType === 'video') {
            photoHTML = `
                <div class="polaroid-photo has-video" style="cursor: pointer;" data-media-index="${itemIndex}">
                    <video preload="metadata">
                        <source src="${data.mediaUrl}#t=0.5" type="video/mp4">
                    </video>
                </div>
            `;
        } else {
            photoHTML = `
                <div class="polaroid-photo" style="cursor: pointer;" data-media-index="${itemIndex}">
                    <img src="${data.mediaUrl}" alt="Birthday photo" loading="lazy">
                </div>
            `;
        }
    } else {
        // No media - show message in colorful background (also clickable!)
        photoHTML = `
            <div class="polaroid-photo no-media" style="cursor: pointer;" data-media-index="${itemIndex}">
                <div class="polaroid-message-only">${escapeHtml(data.message)}</div>
            </div>
        `;
    }
    
    card.innerHTML = `
        ${photoHTML}
        <div class="polaroid-caption">
            <div class="polaroid-name">${escapeHtml(data.name)}</div>
            ${data.mediaUrl ? `<div class="polaroid-message">${escapeHtml(data.message)}</div>` : ''}
        </div>
    `;
    
    // Add click listener for ALL polaroids (with or without media)
    const photoDiv = card.querySelector('.polaroid-photo');
    photoDiv.addEventListener('click', () => {
        const index = parseInt(photoDiv.getAttribute('data-media-index'));
        openMessagePreview(index);
    });
    
    return card;
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

// Format timestamp to relative time
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    if (seconds > 10) return `${seconds}s ago`;
    return 'Just now';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : '❌';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ========================================
   CONFETTI ANIMATION
   ======================================== */

function startConfetti() {
    // Initial burst when page loads
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, 500);
    
    // Random confetti every 10-20 seconds
    setInterval(() => {
        if (Math.random() > 0.5) {
            confetti({
                particleCount: 30,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 30,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }
    }, 15000);
}

/* ========================================
   ERROR HANDLING
   ======================================== */

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

/* ========================================
   POLAROID DROP ANIMATION SYSTEM
   ======================================== */

function addToPolaroidQueue(messageData) {
    polaroidQueue.push(messageData);
    
    // Start dropping if not already dropping
    if (!isDropping) {
        dropNextPolaroid();
    }
}

function dropNextPolaroid() {
    if (polaroidQueue.length === 0) {
        isDropping = false;
        return;
    }
    
    isDropping = true;
    const messageData = polaroidQueue.shift();
    
    // Create polaroid card
    const polaroidCard = createPolaroidCard(messageData);
    const polaroidZone = document.getElementById('polaroidZone');
    
    // Calculate random position and rotation
    const position = calculatePolaroidPosition();
    const rotation = calculatePolaroidRotation();
    
    // Set initial position (will animate from top)
    polaroidCard.style.left = position.x + 'px';
    polaroidCard.style.top = position.y + 'px';
    polaroidCard.style.transform = `rotate(${rotation}deg)`;
    
    // Add to DOM
    polaroidZone.appendChild(polaroidCard);
    
    // Trigger drop animation
    requestAnimationFrame(() => {
        polaroidCard.classList.add('dropping');
    });
    
    droppedCount++;
    
    // Drop next polaroid after delay (1.2 seconds)
    setTimeout(() => {
        dropNextPolaroid();
    }, 1200);
}

function calculatePolaroidPosition() {
    const polaroidZone = document.getElementById('polaroidZone');
    const zoneWidth = polaroidZone.offsetWidth;
    const zoneHeight = polaroidZone.offsetHeight;
    
    // Card dimensions with spacing - smaller cards for mobile
    const cardWidth = window.innerWidth <= 480 ? 150 : window.innerWidth <= 768 ? 200 : 280;
    const cardHeight = window.innerWidth <= 480 ? 210 : window.innerWidth <= 768 ? 280 : 380;
    
    // Spacing between cards - tighter on mobile
    const horizontalSpacing = window.innerWidth <= 480 ? 15 : window.innerWidth <= 768 ? 25 : 60;
    const verticalSpacing = window.innerWidth <= 480 ? 20 : window.innerWidth <= 768 ? 30 : 70;
    
    // Calculate number of columns that can fit
    const availableWidth = zoneWidth - 20; // 10px padding on each side for mobile
    const columnsCount = Math.max(2, Math.floor(availableWidth / (cardWidth + horizontalSpacing)));
    
    // Calculate positions
    const col = droppedCount % columnsCount;
    const row = Math.floor(droppedCount / columnsCount);
    
    // Center the grid horizontally
    const totalGridWidth = (columnsCount * cardWidth) + ((columnsCount - 1) * horizontalSpacing);
    const startX = Math.max(10, (zoneWidth - totalGridWidth) / 2);
    
    // Position with grid layout
    const baseX = startX + (col * (cardWidth + horizontalSpacing));
    const baseY = 50 + (row * (cardHeight + verticalSpacing));
    
    // Add slight random offset for organic feel (but keep it organized) - less on mobile
    const randomOffsetX = window.innerWidth <= 480 ? (Math.random() - 0.5) * 10 : (Math.random() - 0.5) * 30;
    const randomOffsetY = window.innerWidth <= 480 ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 20;
    
    return {
        x: baseX + randomOffsetX,
        y: baseY + randomOffsetY
    };
}

function calculatePolaroidRotation() {
    // Random rotation - reduced for cleaner look
    const maxRotation = window.innerWidth <= 768 ? 6 : 10; // Even smaller rotation for better organization
    return (Math.random() * maxRotation * 2) - maxRotation;
}

/* ========================================
   MEDIA PREVIEW FUNCTIONS
   ======================================== */

function openMessagePreview(index) {
    currentPreviewIndex = index;
    const modal = document.getElementById('mediaPreviewModal');
    const downloadBtn = document.getElementById('downloadMediaBtn');
    
    // Show/hide nav buttons based on number of items
    if (allMediaItems.length <= 1) {
        modal.classList.add('single-media');
    } else {
        modal.classList.remove('single-media');
    }
    
    // Show/hide download button based on media
    const currentItem = allMediaItems[index];
    if (currentItem.mediaUrl) {
        downloadBtn.classList.remove('hidden');
    } else {
        downloadBtn.classList.add('hidden');
    }
    
    updatePreviewContent();
    
    modal.classList.remove('hidden');
    modal.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeMediaPreview() {
    const modal = document.getElementById('mediaPreviewModal');
    modal.classList.remove('active');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}

function navigatePreview(direction) {
    currentPreviewIndex += direction;
    
    // Loop around
    if (currentPreviewIndex < 0) {
        currentPreviewIndex = allMediaItems.length - 1;
    } else if (currentPreviewIndex >= allMediaItems.length) {
        currentPreviewIndex = 0;
    }
    
    // Update download button visibility
    const downloadBtn = document.getElementById('downloadMediaBtn');
    const currentItem = allMediaItems[currentPreviewIndex];
    if (currentItem.mediaUrl) {
        downloadBtn.classList.remove('hidden');
    } else {
        downloadBtn.classList.add('hidden');
    }
    
    updatePreviewContent();
}

function downloadCurrentMedia() {
    const data = allMediaItems[currentPreviewIndex];
    
    // Only download if there's media
    if (!data.mediaUrl) {
        return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = data.mediaUrl;
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const extension = data.mediaType === 'video' ? 'mp4' : 'jpg';
    const filename = `cary-birthday-${data.name.replace(/\s+/g, '-')}-${timestamp}.${extension}`;
    
    link.download = filename;
    link.target = '_blank';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success toast
    showToast(`💾 Download started: ${filename}`, 'success');
}

function updatePreviewContent() {
    const data = allMediaItems[currentPreviewIndex];
    const container = document.getElementById('mediaPreviewContainer');
    const author = document.querySelector('.media-preview-author');
    const message = document.querySelector('.media-preview-message');
    
    // Update media or show message-only view
    if (data.mediaUrl) {
        if (data.mediaType === 'video') {
            container.innerHTML = `
                <video controls autoplay>
                    <source src="${data.mediaUrl}" type="video/mp4">
                </video>
            `;
        } else {
            container.innerHTML = `
                <img src="${data.mediaUrl}" alt="Birthday photo">
            `;
        }
    } else {
        // No media - show large message with gradient background
        container.innerHTML = `
            <div style="background: linear-gradient(135deg, #06beb6 0%, #48b1bf 50%, #06beb6 100%); padding: 3rem; border-radius: 1rem; max-width: 600px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
                <p style="color: white; font-family: 'Caveat', cursive; font-size: 2rem; line-height: 1.6; text-align: center; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); font-weight: 600;">${escapeHtml(data.message)}</p>
            </div>
        `;
    }
    
    // Update caption
    author.textContent = `From: ${data.name}`;
    message.textContent = data.mediaUrl ? data.message : '';
}

console.log("📜 Script loaded successfully!");

