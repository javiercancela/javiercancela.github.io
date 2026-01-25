document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('[data-image-modal]');
  if (!modal) {
    return;
  }

  const modalImage = modal.querySelector('img');
  const modalCaption = modal.querySelector('[data-image-modal-caption]');
  const images = document.querySelectorAll('.post__body figure img');

  if (!modalImage || images.length === 0) {
    return;
  }

  const openModal = (image) => {
    modalImage.src = image.src;
    modalImage.alt = image.alt || '';

    if (modalCaption) {
      const figure = image.closest('figure');
      const caption = figure ? figure.querySelector('figcaption') : null;
      const captionText = caption ? caption.textContent.trim() : '';

      modalCaption.textContent = captionText;
      modalCaption.hidden = captionText === '';
    }

    modal.classList.add('image-modal--open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('image-modal-open');
  };

  const closeModal = () => {
    modal.classList.remove('image-modal--open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('image-modal-open');
    modalImage.src = '';
    modalImage.alt = '';

    if (modalCaption) {
      modalCaption.textContent = '';
      modalCaption.hidden = true;
    }
  };

  images.forEach((image) => {
    image.classList.add('image-modal__trigger');
    image.setAttribute('role', 'button');
    image.setAttribute('tabindex', '0');

    const label = image.alt ? `Open image: ${image.alt}` : 'Open image in modal';
    image.setAttribute('aria-label', label);

    image.addEventListener('click', () => {
      openModal(image);
    });

    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(image);
      }
    });
  });

  modal.addEventListener('click', () => {
    if (modal.classList.contains('image-modal--open')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('image-modal--open')) {
      closeModal();
    }
  });
});
