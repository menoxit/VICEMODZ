// Mobile Navigation Toggle
const hamburger = document.getElementById("hamburger")
const navMenu = document.getElementById("nav-menu")

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active")
  navMenu.classList.toggle("active")
})

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
  })
})

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Header background change on scroll
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header")
  if (window.scrollY > 100) {
    header.style.background = "rgba(0, 0, 0, 0.98)"
    header.style.boxShadow = "0 2px 20px rgba(0, 255, 65, 0.3)"
  } else {
    header.style.background = "rgba(0, 0, 0, 0.95)"
    header.style.boxShadow = "none"
  }
})

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1"
      entry.target.style.transform = "translateY(0)"
    }
  })
}, observerOptions)

// Observe elements for animation
document.querySelectorAll(".service-card, .pricing-card, .about-text, .contact-item").forEach((el) => {
  el.style.opacity = "0"
  el.style.transform = "translateY(30px)"
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
  observer.observe(el)
})

// Enhanced card hover effects
document.querySelectorAll(".pricing-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-15px) scale(1.02)"
    this.style.boxShadow = "0 0 50px rgba(57, 255, 20, 0.6)"
  })

  card.addEventListener("mouseleave", function () {
    this.style.transform = "scale(1.05)"
    this.style.boxShadow = "0 0 30px rgba(57, 255, 20, 0.3)"
  })
})

// Service card hover effects
document.querySelectorAll(".service-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.borderColor = "#00ff41"
    this.style.boxShadow = "0 0 30px rgba(0, 255, 65, 0.3)"
  })

  card.addEventListener("mouseleave", function () {
    if (this.classList.contains("featured")) {
      this.style.borderColor = "#39ff14"
      this.style.boxShadow = "0 0 20px rgba(57, 255, 20, 0.3)"
    } else {
      this.style.borderColor = "#00cc33"
      this.style.boxShadow = "none"
    }
  })
})

// Button ripple effect
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const ripple = document.createElement("span")
    const rect = this.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    ripple.style.width = ripple.style.height = size + "px"
    ripple.style.left = x + "px"
    ripple.style.top = y + "px"
    ripple.classList.add("ripple")

    this.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  })
})

// Add ripple effect styles
const style = document.createElement("style")
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)

// Loading animation
window.addEventListener("load", () => {
  document.body.style.opacity = "0"
  document.body.style.transition = "opacity 0.5s ease"

  setTimeout(() => {
    document.body.style.opacity = "1"
  }, 100)
})

// Parallax effect
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset
  const heroBg = document.querySelector(".hero-bg")

  if (heroBg) {
    heroBg.style.transform = `translateY(${scrolled * 0.3}px)`
  }
})

// ===== SISTEMA DE ADMINISTRAÇÃO E CHAT GLOBAL =====
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
    const adminLink = document.getElementById("admin-link")
    if (adminLink) {
      adminLink.addEventListener("click", (e) => {
        e.preventDefault()
        this.showAdminModal()
      })
    }

    const modalLogin = document.getElementById("modal-login")
    if (modalLogin) {
      modalLogin.addEventListener("click", () => {
        this.attemptAdminLogin()
      })
    }

    const modalCancel = document.getElementById("modal-cancel")
    if (modalCancel) {
      modalCancel.addEventListener("click", () => {
        this.hideAdminModal()
      })
    }

    const adminClose = document.getElementById("admin-close")
    if (adminClose) {
      adminClose.addEventListener("click", () => {
        this.hideAdminPanel()
      })
    }

    // Admin Tabs
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.switchTab(btn.dataset.tab)
      })
    })

    // Chat Global
    const chatToggle = document.getElementById("chat-toggle")
    if (chatToggle) {
      chatToggle.addEventListener("click", () => {
        this.toggleChat()
      })
    }

    const chatClose = document.getElementById("chat-close")
    if (chatClose) {
      chatClose.addEventListener("click", () => {
        this.closeChat()
      })
    }

    const setUsername = document.getElementById("set-username")
    if (setUsername) {
      setUsername.addEventListener("click", () => {
        this.setUsername()
      })
    }

    const sendMessage = document.getElementById("send-message")
    if (sendMessage) {
      sendMessage.addEventListener("click", () => {
        this.sendMessage()
      })
    }

    const messageInput = document.getElementById("message-input")
    if (messageInput) {
      messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage()
        }
      })
    }

    // Contact Form
    const contactForm = document.getElementById("contact-form")
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleContactForm(e)
      })
    }

    // Admin Controls
    const clearChat = document.getElementById("clear-chat")
    if (clearChat) {
      clearChat.addEventListener("click", () => {
        this.clearChat()
      })
    }
  }

  showAdminModal() {
    const modal = document.getElementById("admin-modal")
    if (modal) {
      modal.classList.add("active")
    }
  }

  hideAdminModal() {
    const modal = document.getElementById("admin-modal")
    if (modal) {
      modal.classList.remove("active")
    }
    const passwordInput = document.getElementById("modal-password")
    if (passwordInput) {
      passwordInput.value = ""
    }
  }

  attemptAdminLogin() {
    const passwordInput = document.getElementById("modal-password")
    if (passwordInput) {
      const password = passwordInput.value
      if (password === this.adminPassword) {
        this.isAdminLoggedIn = true
        this.hideAdminModal()
        this.showAdminPanel()
      } else {
        this.showNotification("Senha incorreta!", "error")
      }
    }
  }

  showAdminPanel() {
    const panel = document.getElementById("admin-panel")
    const login = document.getElementById("admin-login")
    const content = document.getElementById("admin-content")

    if (panel) panel.classList.add("active")
    if (login) login.style.display = "none"
    if (content) content.style.display = "flex"

    this.updateStats()
    this.loadMessages()
  }

  hideAdminPanel() {
    const panel = document.getElementById("admin-panel")
    if (panel) {
      panel.classList.remove("active")
    }
    this.isAdminLoggedIn = false
  }

  switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

    // Add active class to selected tab and content
    const tabBtn = document.querySelector(`[data-tab="${tabName}"]`)
    const tabContent = document.getElementById(`${tabName}-tab`)

    if (tabBtn) tabBtn.classList.add("active")
    if (tabContent) tabContent.classList.add("active")

    if (tabName === "chat") {
      this.loadChatHistory()
    }
  }

  handleContactForm(e) {
    const name = e.target.querySelector('input[type="text"]').value
    const email = e.target.querySelector('input[type="email"]').value
    const service = e.target.querySelector("select").value
    const messageText = e.target.querySelector("textarea").value

    if (!name || !email || !service || !messageText) {
      this.showNotification("Por favor, preencha todos os campos!", "error")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      this.showNotification("Por favor, insira um email válido!", "error")
      return
    }

    const message = {
      id: Date.now(),
      name: name,
      email: email,
      service: service,
      message: messageText,
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
    if (!messagesList) return

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
    const messageCount = document.getElementById("message-count")
    if (messageCount) {
      messageCount.textContent = this.messages.length
    }
  }

  // Chat Global Functions
  toggleChat() {
    const chatContainer = document.getElementById("chat-container")
    if (chatContainer) {
      chatContainer.classList.toggle("active")

      if (chatContainer.classList.contains("active")) {
        this.loadChatMessages()
        this.updateOnlineCount()
      }
    }
  }

  closeChat() {
    const chatContainer = document.getElementById("chat-container")
    if (chatContainer) {
      chatContainer.classList.remove("active")
    }
  }

  setUsername() {
    const usernameInput = document.getElementById("username")
    if (!usernameInput) return

    const username = usernameInput.value.trim()
    if (username && username.length >= 2) {
      if (this.bannedUsers.has(username)) {
        this.showNotification("Este usuário foi banido do chat.", "error")
        return
      }

      this.currentUser = username
      this.onlineUsers.add(username)

      const userInfo = document.getElementById("user-info")
      const chatInputArea = document.getElementById("chat-input-area")

      if (userInfo) userInfo.style.display = "none"
      if (chatInputArea) chatInputArea.style.display = "flex"

      this.addSystemMessage(`${username} entrou no chat`)
      this.updateOnlineCount()
    } else {
      this.showNotification("Nome deve ter pelo menos 2 caracteres", "error")
    }
  }

  sendMessage() {
    const messageInput = document.getElementById("message-input")
    if (!messageInput) return

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
    if (!messagesContainer) return

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
    if (!messagesContainer) return

    const messageElement = document.createElement("div")
    messageElement.className = "system-message"
    messageElement.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`

    messagesContainer.appendChild(messageElement)
    this.scrollChatToBottom()
  }

  scrollChatToBottom() {
    const messagesContainer = document.getElementById("chat-messages")
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  loadChatMessages() {
    const messagesContainer = document.getElementById("chat-messages")
    if (!messagesContainer) return

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
    const onlineCount = document.getElementById("online-count")
    const onlineUsers = document.getElementById("online-users")

    if (onlineCount) onlineCount.textContent = `${count} online`
    if (onlineUsers) onlineUsers.textContent = count
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

          const chatContainer = document.getElementById("chat-container")
          if (chatContainer && chatContainer.classList.contains("active")) {
            this.addChatMessage(message)
          }

          // Update chat badge
          const badge = document.getElementById("chat-badge")
          if (badge) {
            const currentCount = Number.parseInt(badge.textContent) || 0
            badge.textContent = currentCount + 1
          }
        }
      }
    }, 30000) // A cada 30 segundos
  }

  updateStats() {
    const totalMessages = document.getElementById("total-messages")
    const chatMessagesCount = document.getElementById("chat-messages-count")
    const totalVisitors = document.getElementById("total-visitors")

    if (totalMessages) totalMessages.textContent = this.messages.length
    if (chatMessagesCount) chatMessagesCount.textContent = this.chatMessages.length

    // Simula visitantes
    const visitors = Math.floor(Math.random() * 50) + 20
    if (totalVisitors) totalVisitors.textContent = visitors
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
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 4000)
  }
}

// Initialize Admin System when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.adminSystem = new AdminSystem()
})
