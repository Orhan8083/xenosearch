document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("togglemenu");

  

    // Toggle menu open/close

    const barMenuBtn = container.querySelector(".barmenu button");

    const menuElements = container.querySelector(".menuelements");

  

    barMenuBtn.addEventListener("click", () => {

      menuElements.classList.toggle("show");

    });

  

    // Page controls

    const aboutUsBtn = container.querySelector(".aboutusbutton");

    const codeBtn = container.querySelector(".codebutton");

  

    const page1 = container.querySelector("#page1");

    const page2 = container.querySelector("#page2");

  

    // Show/hide About Us

    aboutUsBtn.addEventListener("click", () => {

      page1.classList.toggle("show"); // fade in/out

      page2.classList.remove("show"); // make sure other page closes

    });

  

    // Show/hide Code

    codeBtn.addEventListener("click", () => {

      page2.classList.toggle("show");

      page1.classList.remove("show");

    });

  });

  
