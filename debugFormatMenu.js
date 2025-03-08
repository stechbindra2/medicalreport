/**
 * Format Menu Debug Tool
 * Copy and paste this into your browser console to debug format menu issues
 */

// Debug format menu display
function debugFormatMenu() {
  // Get DOM elements
  const toggleBtn = document.getElementById('toggleFormatMenu');
  const menu = document.getElementById('formatMenu');
  const options = document.querySelectorAll('.format-option');
  
  console.log('=== Format Menu Debug ===');
  console.log('Toggle button exists:', !!toggleBtn);
  console.log('Menu exists:', !!menu);
  console.log('Format options count:', options.length);
  
  if (menu) {
    // Check computed styles
    const styles = window.getComputedStyle(menu);
    console.log('Menu visibility:', styles.visibility);
    console.log('Menu display:', styles.display);
    console.log('Menu opacity:', styles.opacity);
    console.log('Menu z-index:', styles.zIndex);
    console.log('Menu position:', styles.position);
    
    // Check class list
    console.log('Menu has hidden class:', menu.classList.contains('hidden'));
    
    // Force show menu for testing
    menu.classList.remove('hidden');
    menu.style.display = 'block';
    menu.style.visibility = 'visible';
    menu.style.opacity = '1';
    menu.style.zIndex = '10000';
    
    console.log('Menu should now be visible. If not, check for parent element issues.');
  }
  
  // Check event listeners
  if (toggleBtn) {
    console.log('Adding test event listener to toggle button...');
    toggleBtn.addEventListener('click', function(e) {
      console.log('Toggle button clicked!');
      e.preventDefault();
      e.stopPropagation();
      
      if (menu) {
        menu.classList.remove('hidden');
        menu.style.display = 'block';
        menu.style.visibility = 'visible';
        menu.style.opacity = '1';
        menu.style.zIndex = '10000';
        console.log('Menu should now be visible');
      }
    });
  }
}

// Run the debug function
debugFormatMenu();

// Output instructions
console.log('\nInstructions:');
console.log('1. Click "Download As" to test if the menu appears');
console.log('2. If still not visible, try running: document.getElementById("formatMenu").style.display = "block"');
console.log('3. Check if any parent elements have overflow:hidden or z-index issues');
