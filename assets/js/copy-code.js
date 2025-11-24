document.addEventListener('DOMContentLoaded', () => {
  const codeBlocks = document.querySelectorAll('pre.highlight');

  codeBlocks.forEach((codeBlock) => {
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-code-button';
    copyButton.type = 'button';
    copyButton.ariaLabel = 'Copy code to clipboard';
    copyButton.innerText = 'Copy';

    codeBlock.style.position = 'relative';
    codeBlock.appendChild(copyButton);

    copyButton.addEventListener('click', () => {
      const code = codeBlock.querySelector('code').innerText;

      navigator.clipboard.writeText(code).then(() => {
        copyButton.innerText = 'Copied!';
        copyButton.classList.add('copied');

        setTimeout(() => {
          copyButton.innerText = 'Copy';
          copyButton.classList.remove('copied');
        }, 2000);
      }).catch((err) => {
        console.error('Failed to copy: ', err);
        copyButton.innerText = 'Error';
      });
    });
  });
});
