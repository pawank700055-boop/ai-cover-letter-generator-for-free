document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const outputContainer = document.getElementById('output-container');
    const loader = document.getElementById('loader');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Modal elements
    const privacyModal = document.getElementById('privacy-modal');
    const termsModal = document.getElementById('terms-modal');
    const openPrivacy = document.getElementById('open-privacy');
    const openTerms = document.getElementById('open-terms');
    const closeBtns = document.querySelectorAll('.close-btn');

    // Modal Event Listeners
    openPrivacy.addEventListener('click', (e) => {
        e.preventDefault();
        privacyModal.style.display = 'flex';
    });

    openTerms.addEventListener('click', (e) => {
        e.preventDefault();
        termsModal.style.display = 'flex';
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            document.getElementById(modalId).style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === privacyModal) privacyModal.style.display = 'none';
        if (e.target === termsModal) termsModal.style.display = 'none';
    });

    // Form Submission & Gemini API integration
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userName = document.getElementById('userName').value.trim();
        const jobTitle = document.getElementById('jobTitle').value.trim();
        const companyName = document.getElementById('companyName').value.trim();
        const experienceLevel = document.getElementById('experienceLevel').value;
        const keySkills = document.getElementById('keySkills').value.trim();
        const tone = document.getElementById('tone').value;
        const apiKey = document.getElementById('apiKey').value.trim();

        if (!apiKey) {
            alert('Please provide your Gemini API key.');
            return;
        }

        // Show loader, reset output
        outputContainer.classList.add('hidden');
        loader.classList.remove('hidden');
        copyBtn.disabled = true;
        downloadBtn.disabled = true;

        const prompt = `Write a professional cover letter based on the following details:
- Applicant Name: ${userName}
- Target Job Title: ${jobTitle}
- Company Name: ${companyName}
- Experience Level: ${experienceLevel}
- Key Skills: ${keySkills}
- Tone/Style: ${tone}

Ensure the cover letter is structured professionally with standard formatting (salutation, body paragraphs highlighting experience and alignment with skills, and a professional sign-off). Do not include placeholders like [Your Address] if data can be smoothly woven or omitted. Return only the text of the cover letter.`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to generate response from Gemini API.');
            }

            const candidate = data.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) {
                const coverLetterText = candidate.content.parts[0].text;
                outputContainer.textContent = coverLetterText;
                outputContainer.classList.remove('placeholder');
                copyBtn.disabled = false;
                downloadBtn.disabled = false;
            } else {
                throw new Error('Invalid response structure received from Gemini API.');
            }

        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
            outputContainer.textContent = 'Failed to generate cover letter. Please verify your API key and try again.';
            outputContainer.classList.add('placeholder');
        } finally {
            loader.classList.add('hidden');
            outputContainer.classList.remove('hidden');
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const textToCopy = outputContainer.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    // Download as PDF using html2pdf
    downloadBtn.addEventListener('click', () => {
        const element = outputContainer;
        const opt = {
            margin:       1,
            filename:     'Cover_Letter.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    });
});