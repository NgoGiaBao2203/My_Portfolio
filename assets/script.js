document.addEventListener("DOMContentLoaded", () => {
  // ====================================
  // 1. LANGUAGE SWITCHING (i18n)
  // ====================================
  const langSwitchBtn = document.getElementById("lang-switch");
  let currentLang = "en";
  localStorage.setItem("portfolio_lang", "en");

  // Lưu nội dung gốc của tất cả phần tử để dịch qua lại không bị mất icon/span
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    if (!element.dataset.originalHtml) {
      element.dataset.originalHtml = element.innerHTML;
    }
  });

  // Cập nhật trạng thái nút EN / VI
  function updateLanguageToggle() {
    if (!langSwitchBtn) return;

    if (currentLang === "vi") {
      langSwitchBtn.classList.add("vi-active");
    } else {
      langSwitchBtn.classList.remove("vi-active");
    }
  }

  // Áp dụng bản dịch
  async function applyTranslations(lang) {
    try {
      const response = await fetch(`locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Cannot load locales/${lang}.json`);
      }

      const translations = await response.json();

      document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        const translatedText = translations[key];

        // Nếu không có key thì bỏ qua
        if (!translatedText) return;

        // Khôi phục HTML gốc trước khi thay đổi
        const originalHtml = element.dataset.originalHtml || element.innerHTML;

        // Nếu có icon <i> hoặc các thẻ HTML khác
        if (originalHtml.includes("<")) {
          const temp = document.createElement("div");
          temp.innerHTML = originalHtml;

          // Tìm node text đầu tiên và thay bằng bản dịch
          let textUpdated = false;

          temp.childNodes.forEach((node) => {
            if (
              !textUpdated &&
              node.nodeType === Node.TEXT_NODE &&
              node.textContent.trim() !== ""
            ) {
              node.textContent = translatedText + " ";
              textUpdated = true;
            }
          });

          // Nếu không có text node thì thêm text mới vào đầu
          if (!textUpdated) {
            temp.insertAdjacentText("afterbegin", translatedText + " ");
          }

          element.innerHTML = temp.innerHTML;
        } else {
          // Chỉ có text thuần
          element.textContent = translatedText;
        }
      });

      // Cập nhật thuộc tính lang
      document.documentElement.lang = lang;

      // Lưu localStorage
      localStorage.setItem("portfolio_lang", lang);

      // Cập nhật biến hiện tại
      currentLang = lang;

      // Cập nhật nút toggle
      updateLanguageToggle();
    } catch (error) {
      console.error("Translation error:", error);
    }
  }

  // ====================================
  // 2. CLICK EN / VI
  // ====================================
  if (langSwitchBtn) {
    langSwitchBtn.addEventListener("click", () => {
      // Xác định ngôn ngữ tiếp theo: Nếu đang là "en" thì đổi thành "vi" và ngược lại
      const nextLang = currentLang === "en" ? "vi" : "en";

      // Thực hiện đổi ngôn ngữ
      applyTranslations(nextLang);
    });
  }

  // Khởi tạo ngôn ngữ khi tải trang
  applyTranslations(currentLang);

  // ====================================
  // 3. NAVBAR SCROLL EFFECT
  // ====================================
  const navbar = document.getElementById("navbar");

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (navbar) {
      if (scrollTop > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }

      // Navbar luôn cố định
      navbar.style.transform = "translateY(0)";
    }
  });

  // ====================================
  // 4. SMOOTH SCROLL
  // ====================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (href && href !== "#") {
        e.preventDefault();

        const target = document.querySelector(href);

        if (target) {
          const offsetTop =
            target.getBoundingClientRect().top + window.pageYOffset - 100;

          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });

          // Active nav link
          document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
            link.classList.remove("active");
          });

          this.classList.add("active");

          // Đóng menu mobile
          const collapse = document.querySelector(".navbar-collapse");

          if (collapse && collapse.classList.contains("show")) {
            const bsCollapse = new bootstrap.Collapse(collapse, {
              toggle: false,
            });
            bsCollapse.hide();
          }
        }
      }
    });
  });

  // ====================================
  // 5. SCROLL ANIMATION
  // ====================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".project-card, .skill-category, .gallery-item")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });

  // ====================================
  // 6. ACTIVE NAV LINK ON SCROLL
  // ====================================
  window.addEventListener("scroll", () => {
    let current = "";

    const sections = document.querySelectorAll("#home, #portfolio, #skills");

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;

      if (window.pageYOffset >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
      link.classList.remove("active");

      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // ====================================
  // 7. TAB SWITCHING
  // ====================================
  const skillsSection = document.getElementById("skills");
  document.querySelectorAll('[data-bs-toggle="tab"]').forEach((button) => {
    button.addEventListener("shown.bs.tab", (e) => {
      const targetId = e.target.getAttribute("data-bs-target");
      const content = document.querySelector(targetId);
      if (content) {
        content.querySelectorAll("img").forEach((img) => {
          img.style.animation = "fadeIn 0.6s ease";
        });
      }
      if (skillsSection) {
        if (targetId === "#photo-content") {
          skillsSection.style.display = "none";
        } else {
          skillsSection.style.display = "block";
        }
      }
    });
  });

  // ====================================
  // 8. EMAIL TRACKING
  // ====================================
  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.addEventListener("click", () => {
      console.log("Email clicked:", link.href);
    });
  });

  // ====================================
  // 9. MOBILE MENU AUTO CLOSE
  // ====================================
  const navbarCollapse = document.querySelector(".navbar-collapse");

  document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
          toggle: false,
        });
        bsCollapse.hide();
      }
    });
  });

  // ====================================
  // 10. LAZY LOAD IMAGES
  // ====================================
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add("loaded");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // ====================================
  // 11. ALWAYS LIGHT MODE
  // ====================================
  document.documentElement.removeAttribute("data-bs-theme");
});
