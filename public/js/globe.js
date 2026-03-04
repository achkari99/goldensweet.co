// Interactive 3D Globe for Provenance Map - Moroccan Cities
import createGlobe from 'https://esm.sh/cobe';

export function initProvenanceGlobe() {
    const canvas = document.getElementById('provenance-globe');
    if (!canvas) return;

    let phi = -2.7;     // Initial horizontal rotation (edit this for left/right)
    let theta = 0.15;   // Initial vertical tilt (edit this for up/down)
    let width = 0;

    // Moroccan cities coordinates for markers
    // Using approximate coordinates for the cities mentioned
    const markers = [
        { location: [31.6295, -5.0], size: 0.05 },    // Moving east
    ];

    // Pointer interaction
    let pointerInteracting = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const onResize = () => {
        if (canvas) {
            width = canvas.offsetWidth;
        }
    };
    onResize();
    window.addEventListener('resize', onResize);

    const globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: -0.8, // Start position to show Europe/Africa centered
        theta: 0.25,
        dark: 0,   // Light mode
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 8,
        baseColor: [0.8, 0.85, 0.82],        // Soft sage green matching website
        markerColor: [0.8, 0.62, 0.28],       // Golden color (#cd9f47)
        glowColor: [0.78, 0.86, 0.85],        // Soft sage glow
        markers: markers,
        scale: 1,
        opacity: 0.9,
        onRender: (state) => {
            // Update state with current phi and theta values
            state.phi = phi;
            state.theta = theta;

            // Slow automatic rotation when not interacting
            if (!pointerInteracting) {
                phi += 0.0009;
            }

            state.width = width * 2;
            state.height = width * 2;
        }
    });

    // Mouse/Touch interaction - make it draggable
    canvas.style.cursor = 'grab';

    canvas.addEventListener('pointerdown', (e) => {
        pointerInteracting = true;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('pointerup', () => {
        pointerInteracting = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('pointerout', () => {
        pointerInteracting = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('pointermove', (e) => {
        if (pointerInteracting) {
            const deltaX = e.clientX - lastPointerX;
            const deltaY = e.clientY - lastPointerY;

            phi += deltaX * 0.005;
            theta += deltaY * 0.005;

            // Clamp theta to prevent flipping
            theta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, theta));

            lastPointerX = e.clientX;
            lastPointerY = e.clientY;
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (pointerInteracting && e.touches[0]) {
            const deltaX = e.touches[0].clientX - lastPointerX;
            const deltaY = e.touches[0].clientY - lastPointerY;

            phi += deltaX * 0.005;
            theta += deltaY * 0.005;

            // Clamp theta to prevent flipping
            theta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, theta));

            lastPointerX = e.touches[0].clientX;
            lastPointerY = e.touches[0].clientY;
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchstart', (e) => {
        if (e.touches[0]) {
            pointerInteracting = true;
            lastPointerX = e.touches[0].clientX;
            lastPointerY = e.touches[0].clientY;
        }
    });

    canvas.addEventListener('touchend', () => {
        pointerInteracting = false;
    });

    return globe;
}
