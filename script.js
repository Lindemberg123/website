
document.addEventListener("DOMContentLoaded", function () {
  const info = [
    "🚀 Nome: Sean",
    "🧠 Criador de ideias e projetos próprios",
    "📱 Atua com desenvolvimento mobile pelo celular",
    "🌐 Criei meu próprio site: vexbotsite.netlify.app",
    "💾 Experiência com BDFD, Replit, Netlify e GitHub",
    "📌 Buscando otimizar bots de forma criativa",
    "🛠️ Experiência em HTML, CSS, JavaScript e Python",
    "⚙️ Automatizando tudo o que puder (inclusive APIs)",
    "👥 Criador da Ssync Apps – uma central de bots únicos",
    "📚 Aprendizado constante com foco em bots prontos",
    "📈 Sempre buscando performance e inovação"
  ];

  const container = document.querySelector("main");

  info.forEach((text, index) => {
    const p = document.createElement("p");
    p.textContent = text;
    p.style.animationDelay = `${index * 0.3}s`;
    container.appendChild(p);
  });
});
