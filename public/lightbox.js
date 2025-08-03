document.addEventListener('DOMContentLoaded', function () {
    let scrollPosition = 0;

    document.querySelectorAll('a[href^="#lightbox"], a[href^="#poster"]').forEach(function (link) {
        link.addEventListener('click', function () {
            scrollPosition = window.pageYOffset;
        });
    });

    window.addEventListener('hashchange', function () {
        if (!window.location.hash) {
            setTimeout(() => window.scrollTo(0, scrollPosition), 0);
        }
    });

    function closeLightbox(e) {
        e.preventDefault();
        window.location.hash = '';
    }

    document.querySelectorAll('.lightbox .close, .lightbox .backdrop').forEach(function (element) {
        element.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && window.location.hash &&
            (window.location.hash.includes('lightbox') || window.location.hash.includes('poster'))) {
            closeLightbox(e);
        }
    });
});