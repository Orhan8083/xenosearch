document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("togglemenu");

    const barMenuBtn = container.querySelector(".barmenu button");

    const menuElements = container.querySelector(".menuelements");

    barMenuBtn.addEventListener("click", () => {

      menuElements.classList.toggle("show");

    });

    const aboutUsBtn = container.querySelector(".aboutusbutton");

    const codeBtn = container.querySelector(".codebutton");

    const page1 = container.querySelector("#page1");

    const page2 = container.querySelector("#page2");

    aboutUsBtn.addEventListener("click", () => {

      page1.classList.toggle("show");

      page2.classList.remove("show");
        
    });

    codeBtn.addEventListener("click", () => {

      page2.classList.toggle("show");

      page1.classList.remove("show");

    });
});
