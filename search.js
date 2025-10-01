document.addEventListener("DOMContentLoaded", () => {
    // Existing menu functionality
    const container = document.getElementById("togglemenu");
    const barMenuBtn = container.querySelector(".barmenu button");
    const menuElements = container.querySelector(".menuelements");
    const aboutUsBtn = container.querySelector(".aboutusbutton");
    const codeBtn = container.querySelector(".codebutton");
    const page1 = container.querySelector("#page1");
    const page2 = container.querySelector("#page2");

    barMenuBtn.addEventListener("click", () => {
        menuElements.classList.toggle("show");
    });

    aboutUsBtn.addEventListener("click", () => {
        page1.classList.toggle("show");
        page2.classList.remove("show");
        aiPage.classList.remove("show");
    });

    codeBtn.addEventListener("click", () => {
        page2.classList.toggle("show");
        page1.classList.remove("show");
        aiPage.classList.remove("show");
    });

    // New AI Search Functionality
    const searchForm = document.querySelector("#Bar form");
    const searchInput = document.querySelector("#Bar form input");
    
    // Create AI Response Page (similar to page1 and page2)
    const aiPage = document.createElement("div");
    aiPage.id = "aiPage";
    aiPage.innerHTML = `
        <button type="button" class="close-btn" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
        <h1>AI SEARCH RESULTS</h1>
        <div class="question-section">
            <h3>Your Question:</h3>
            <p id="question-display" style="font-family: 'Overpass-Regular'; color: #ffffff; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 10px;"></p>
        </div>
        <div class="answer-section">
            <h3>Answer:</h3>
            <div id="answer-display" style="font-family: 'Overpass-Light'; color: #ffffff; line-height: 1.6; max-height: 300px; overflow-y: auto; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;"></div>
        </div>
        <div class="loading" id="loading" style="display: none; text-align: center; padding: 20px;">
            <p style="color: #ffffff; font-family: 'Overpass-Regular';">Processing your question with AI...</p>
        </div>
    `;
    
    // Apply same styling as other pages
    aiPage.style.cssText = `
        background-color: #07173F;
        color: #ffffff;
        border-radius: 25px;
        border: 2px solid #ffffff;
        margin: auto;
        position: fixed;
        top: 50%;
        left: 50%;
        text-align: left;
        transform: translate(-50%, -50%);
        width: 80%;
        max-width: 600px;
        height: auto;
        min-height: 400px;
        max-height: 80vh;
        padding: 30px;
        font-size: 16px;
        z-index: 4;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.5s ease, visibility 0s linear 0.5s;
        box-sizing: border-box;
        overflow-y: auto;
    `;
    
    document.body.appendChild(aiPage);

    // Close button functionality
    aiPage.querySelector('.close-btn').addEventListener('click', () => {
        aiPage.classList.remove('show');
    });

    // Search form submission
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const question = searchInput.value.trim();
        if (!question) return;
        
        // Show loading state
        showAIPage();
        displayLoading(true);
        
        try {
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: question })
            });
            
            const data = await response.json();
            
            if (data.success) {
                displayResults(question, data.answer);
            } else {
                displayError(data.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            console.error('Error:', error);
            displayError('Failed to connect to AI service. Please check if the Python API is running.');
        } finally {
            displayLoading(false);
        }
    });

    function showAIPage() {
        // Hide other pages
        page1.classList.remove('show');
        page2.classList.remove('show');
        menuElements.classList.remove('show');
        
        // Show AI page
        aiPage.classList.add('show');
    }

    function displayLoading(show) {
        const loadingElement = document.getElementById('loading');
        const answerDisplay = document.getElementById('answer-display');
        const questionDisplay = document.getElementById('question-display');
        
        if (show) {
            loadingElement.style.display = 'block';
            answerDisplay.innerHTML = '';
            questionDisplay.innerHTML = '';
        } else {
            loadingElement.style.display = 'none';
        }
    }

    function displayResults(question, answer) {
        const questionDisplay = document.getElementById('question-display');
        const answerDisplay = document.getElementById('answer-display');
        
        questionDisplay.textContent = question;
        answerDisplay.innerHTML = formatAnswer(answer);
    }

    function displayError(errorMessage) {
        const questionDisplay = document.getElementById('question-display');
        const answerDisplay = document.getElementById('answer-display');
        
        questionDisplay.textContent = searchInput.value;
        answerDisplay.innerHTML = `<p style="color: #E43700;">Error: ${errorMessage}</p>`;
    }

    function formatAnswer(answer) {
        // Basic formatting for the answer text
        return answer.replace(/\n/g, '<br>');
    }
});