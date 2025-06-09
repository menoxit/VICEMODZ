// Sistema de Administração e Chat Global
class AdminSystem {
  constructor() {
    this.adminPassword = "vicemodz2024" // Mude esta senha!
    this.isAdminLoggedIn = false
    this.messages = JSON.parse(localStorage.getItem("vicemodz_messages") || "[]")
    this.chatMessages = JSON.parse(localStorage.getItem("vicemodz_chat") || "[]")
    this.onlineUsers = new Set()
    this.currentUser = null
    this.bannedUsers = new Set()

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.updateStats()
    this.loadMessages()
    this.loadChatHistory()
    this.simulateOnlineUsers()
  }

  setupEventListeners() {
    // Admin Panel
    document.getElementById("admin-link").addEventListener("click", (e) => {
      e.preventDefault()
      this.showAdminModal()
    })

    document.getElementById("modal-login").addEventListener("click", () => {
      this.attemptAdminLogin()
    })

    document.getElementById("modal-cancel").addEventListener("click", () => {
      this.hideAdminModal()
    })

    document.getElementById("admin-close").addEventListener("click", () => {
      this.hideAdminPanel()
    })

    // Admin Tabs
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.switchTab(btn.dataset.tab)
      })
    })

    // Chat Global
    document.getElementById("chat-toggle").addEventListener("click", () => {
      this.toggleChat()
    })

    document.getElementById("chat-close").addEventListener("click", () => {
      this.closeChat()
    })

    document.getElementById("set-username").addEventListener("click", () => {
      this.setUsername()
    })

    document.getElementById("send-message").addEventListener("click", () => {
      this.sendMessage()
    })

    document.getElementById("message-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage()
      }
    })

    // Contact Form
    document.getElementById("contact-form").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleContactForm(e)
    })

    // Admin Controls
    document.getElementById("clear-chat")?.addEventListener("click", () => {
      this.clearChat()
    })
  }

  showAdminModal() {
    document.getElementById("admin-modal").classList.add("active")
  }

  hideAdminModal() {
    document.getElementById("admin-modal").classList.remove("active")
    document.getElementById("modal-password").value = ""
  }

  attemptAdminLogin() {
    const password = document.getElementById("modal-password").value
    if (password === this.adminPassword) {
      this.isAdminLoggedIn = true
      this.hideAdminModal()
      this.showAdminPanel()
    } else {
      this.showNotification("Senha incorreta!", "error")
    }
  }

  showAdminPanel() {
    document.getElementById("admin-panel").classList.add("active")
    document.getElementById("admin-login").style.display = "none"
    document.getElementById("admin-content").style.display = "flex"
    this.updateStats()
    this.loadMessages()
  }

  hideAdminPanel() {
    document.getElementById("admin-panel").classList.remove("active")
    this.isAdminLoggedIn = false
  }

  switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")
    document.getElementById(`${tabName}-tab`).classList.add("active")

    if (tabName === "chat") {
      this.loadChatHistory()
    }
  }

  handleContactForm(e) {
    const formData = new FormData(e.target)
    const message = {
      id: Date.now(),
      name: formData.get("name") || e.target.querySelector('input[type="text"]').value,
      email: formData.get("email") || e.target.querySelector('input[type="email"]').value,
      service: formData.get("service") || e.target.querySelector("select").value,
      message: formData.get("message") || e.target.querySelector("textarea").value,
      timestamp: new Date().toISOString(),
      read: false,
    }

    this.messages.push(message)
    this.saveMessages()
    this.updateStats()

    // Simulate form submission
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...'
    submitBtn.disabled = true

    setTimeout(() => {
      this.showNotification("Mensagem enviada com sucesso! Entraremos em contato em breve.", "success")
      e.target.reset()
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    }, 2000)
  }

  saveMessages() {
    localStorage.setItem("vicemodz_messages", JSON.stringify(this.messages))
  }

  loadMessages() {
    const messagesList = document.getElementById("messages-list")

    if (this.messages.length === 0) {
      messagesList.innerHTML = `
        <div class="no-messages">
          <i class="fas fa-inbox"></i>
          <p>Nenhuma mensagem ainda</p>
        </div>
      `
      return
    }

    messagesList.innerHTML = this.messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(
        (msg) => `
        <div class="message-item">
          <div class="message-meta">
            <span><i class="fas fa-user"></i> ${msg.name} (${msg.email})</span>
            <span><i class="fas fa-clock"></i> ${new Date(msg.timestamp).toLocaleString("pt-BR")}</span>
          </div>
          <div class="message-content">
            <p><strong>Serviço:</strong> ${msg.service}</p>
            <p><strong>Mensagem:</strong> ${msg.message}</p>
          </div>
        </div>
      `,
      )
      .join("")

    // Update message count
    document.getElementById("message-count").textContent = this.messages.length
  }

  // Chat Global Functions
  toggleChat() {
    const chatContainer = document.getElementById("chat-container")
    chatContainer.classList.toggle("active")

    if (chatContainer.classList.contains("active")) {
      this.loadChatMessages()
      this.updateOnlineCount()
    }
  }

  closeChat() {
    document.getElementById("chat-container").classList.remove("active")
  }

  setUsername() {
    const username = document.getElementById("username").value.trim()
    if (username && username.length >= 2) {
      if (this.bannedUsers.has(username)) {
        this.showNotification("Este usuário foi banido do chat.", "error")
        return
      }

      this.currentUser = username
      this.onlineUsers.add(username)

      document.getElementById("user-info").style.display = "none"
      document.getElementById("chat-input-area").style.display = "flex"

      this.addSystemMessage(`${username} entrou no chat`)
      this.updateOnlineCount()
    } else {
      this.showNotification("Nome deve ter pelo menos 2 caracteres", "error")
    }
  }

  sendMessage() {
    const messageInput = document.getElementById("message-input")
    const messageText = messageInput.value.trim()

    if (messageText && this.currentUser) {
      const message = {
        id: Date.now(),
        user: this.currentUser,
        text: messageText,
        timestamp: new Date().toISOString(),
      }

      this.chatMessages.push(message)
      this.saveChatMessages()
      this.addChatMessage(message)

      messageInput.value = ""
      this.scrollChatToBottom()
    }
  }

  addChatMessage(message) {
    const messagesContainer = document.getElementById("chat-messages")
    const messageElement = document.createElement("div")
    messageElement.className = "message"
    messageElement.innerHTML = `
      <div class="message-header">
        <span class="message-user">${message.user}</span>
        <span class="message-time">${new Date(message.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div class="message-text">${message.text}</div>
    `

    messagesContainer.appendChild(messageElement)
    this.scrollChatToBottom()
  }

  addSystemMessage(text) {
    const messagesContainer = document.getElementById("chat-messages")
    const messageElement = document.createElement("div")
    messageElement.className = "system-message"
    messageElement.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`

    messagesContainer.appendChild(messageElement)
    this.scrollChatToBottom()
  }

  scrollChatToBottom() {
    const messagesContainer = document.getElementById("chat-messages")
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  loadChatMessages() {
    const messagesContainer = document.getElementById("chat-messages")
    messagesContainer.innerHTML = `
      <div class="system-message">
        <i class="fas fa-info-circle"></i>
        Bem-vindo ao chat global! Converse com outros usuários em tempo real.
      </div>
    `

    this.chatMessages.forEach((message) => {
      this.addChatMessage(message)
    })
  }

  loadChatHistory() {
    const chatHistory = document.getElementById("chat-history")
    if (chatHistory) {
      chatHistory.innerHTML = this.chatMessages
        .map(
          (msg) => `
          <div class="message">
            <div class="message-header">
              <span class="message-user">${msg.user}</span>
              <span class="message-time">${new Date(msg.timestamp).toLocaleString("pt-BR")}</span>
            </div>
            <div class="message-text">${msg.text}</div>
          </div>
        `,
        )
        .join("")
    }
  }

  saveChatMessages() {
    localStorage.setItem("vicemodz_chat", JSON.stringify(this.chatMessages))
  }

  clearChat() {
    if (confirm("Tem certeza que deseja limpar todo o chat?")) {
      this.chatMessages = []
      this.saveChatMessages()
      this.loadChatHistory()
      this.loadChatMessages()
      this.showNotification("Chat limpo com sucesso!", "success")
    }
  }

  updateOnlineCount() {
    const count = this.onlineUsers.size
    document.getElementById("online-count").textContent = `${count} online`
    document.getElementById("online-users").textContent = count
  }

  simulateOnlineUsers() {
    // Simula usuários online
    const fakeUsers = ["João", "Maria", "Pedro", "Ana", "Carlos"]
    const randomCount = Math.floor(Math.random() * 5) + 1

    for (let i = 0; i < randomCount; i++) {
      this.onlineUsers.add(fakeUsers[i])
    }

    this.updateOnlineCount()

    // Simula mensagens ocasionais
    setInterval(() => {
      if (Math.random() < 0.1 && this.onlineUsers.size > 0) {
        // 10% chance a cada intervalo
        const users = Array.from(this.onlineUsers)
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const messages = [
          "Alguém já testou os mods?",
          "Muito bom o trabalho de vocês!",
          "Como faço para encomendar?",
          "Recomendo demais!",
          "Suporte top!",
        ]
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]

        if (randomUser !== this.currentUser) {
          const message = {
            id: Date.now(),
            user: randomUser,
            text: randomMessage,
            timestamp: new Date().toISOString(),
          }

          this.chatMessages.push(message)
          this.saveChatMessages()

          if (document.getElementById("chat-container").classList.contains("active")) {
            this.addChatMessage(message)
          }

          // Update chat badge
          const badge = document.getElementById("chat-badge")
          const currentCount = Number.parseInt(badge.textContent) || 0
          badge.textContent = currentCount + 1
        }
      }
    }, 30000) // A cada 30 segundos
  }

  updateStats() {
    document.getElementById("total-messages").textContent = this.messages.length
    document.getElementById("chat-messages-count").textContent = this.chatMessages.length

    // Simula visitantes
    const visitors = Math.floor(Math.random() * 50) + 20
    document.getElementById("total-visitors").textContent = visitors
  }

  showNotification(message, type) {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
      <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}"></i>
      <span>${message}</span>
    `

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#00ff41" : "#ff4444"};
      color: #000000;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 0 20px ${type === "success" ? "#00ff41" : "#ff4444"};
      z-index: 10000;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
      notification.style.transform = "translateX(400px)"
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 4000)
  }
}

// Initialize Admin System
document.addEventListener("DOMContentLoaded", () => {
  window.adminSystem = new AdminSystem()
})
