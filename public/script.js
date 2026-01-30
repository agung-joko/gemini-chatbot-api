const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitButton = form.querySelector('button');

// Store conversation history for context
let conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Add user message to UI
  appendMessage('user', userMessage);
  input.value = '';
  input.disabled = true;
  submitButton.disabled = true;

  // Add to history (using 'text' to match backend index.js expectation)
  conversation.push({ role: 'user', text: userMessage });

  // 2. Show temporary "Thinking..." message
  const loadingMsg = appendMessage('bot', 'Thinking...');

  try {
    // 3. Send POST request
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Failed to get response');

    // 4. Replace "Thinking..." with AI's reply
    loadingMsg.textContent = data.result;
    loadingMsg.innerHTML = parseMarkdown(data.result);
    conversation.push({ role: 'model', text: data.result });

  } catch (error) {
    console.error(error);
    loadingMsg.textContent = 'Sorry, no response received.';
  } finally {
    input.disabled = false;
    submitButton.disabled = false;
    input.focus();
    // Ensure scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  msg.innerHTML = parseMarkdown(text);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return element to allow updating text later
}

// Fungsi sederhana untuk mengubah Markdown menjadi HTML
function parseMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;') // Mencegah XSS (keamanan)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/\n/g, '<br>'); // Baris baru
}
