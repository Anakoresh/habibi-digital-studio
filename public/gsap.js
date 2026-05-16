const blobs = document.querySelectorAll('.blob');

blobs.forEach(blob => {
    gsap.to(blob, {
        x: "random(-150,150)",
        y: "random(-150,150)",
        duration: "random(10,20)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
});

// floating phones

gsap.to('.phone-card', {
    y: -20,
    duration: 3,
    repeat: -1,
    yoyo: true,
    stagger: 0.3,
    ease: 'sine.inOut'
});