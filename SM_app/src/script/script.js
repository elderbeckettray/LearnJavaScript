// ...existing code...
(function(){
    // Track all initialized components
    const instances = [];

    function initProgressComponent(root){
        const numerEl = root.querySelector('.progress-numerator');
        const denomEl = root.querySelector('.progress-denominator');
        const outside = root.querySelector('.outside');
        const numInput = root.querySelector('.numeratorInput');
        const denInput = root.querySelector('.denominatorInput');

        if(!numerEl || !denomEl || !outside){
            console.warn('Progress init: missing elements on', root);
            return null;
        }

        function updateFromDOM(){
            const n = Number(numerEl.textContent) || 0;
            const d = Number(denomEl.textContent) || 1;
            const pct = Math.max(0, Math.min(100, (n / d) * 100));
            outside.style.setProperty('--pct', String(pct));
        }

        function syncSpansFromInputs(){
            if(numInput){
                const n = Math.max(0, Number(numInput.value) || 0);
                numerEl.textContent = String(n);
            }
            if(denInput){
                const d = Math.max(1, Number(denInput.value) || 1);
                denomEl.textContent = String(d);
            }
            updateFromDOM();
        }

        if(numInput) numInput.addEventListener('input', syncSpansFromInputs);
        if(denInput) denInput.addEventListener('input', syncSpansFromInputs);

        // initial render
        syncSpansFromInputs();

        // remove button (if present) will remove this component and its instance
        const removeBtn = root.querySelector('.removeBtn');
        if(removeBtn){
            removeBtn.addEventListener('click', ()=>{
                const idx = instances.findIndex(i => i.root === root);
                if(idx !== -1){
                    instances.splice(idx, 1);
                }
                // remove DOM
                root.remove();
            });
        }

        function setProgress(n, d){
            const nn = Number(n) || 0;
            const dd = Math.max(1, Number(d) || 1);
            if(numInput) numInput.value = String(nn);
            if(denInput) denInput.value = String(dd);
            numerEl.textContent = String(nn);
            denomEl.textContent = String(dd);
            updateFromDOM();
        }

        return { root, setProgress };
    }

    function createProgressItem(initialN = 0, initialD = 1){
        const item = document.createElement('div');
        item.className = 'progress-item';
        item.innerHTML = `
            <div class="outside" aria-label="progress">
                <div class="inside">
                    <div class="progress">
                        <span class="progress-numerator">${initialN}</span> / <span class="progress-denominator">${initialD}</span>
                    </div>
                </div>
            </div>
            <div class="controls" aria-hidden="false">
                <label>
                    Numerator
                    <input class="numeratorInput" type="number" min="0" value="${initialN}" inputmode="numeric" />
                </label>
                <label>
                    Denominator
                    <input class="denominatorInput" type="number" min="1" value="${initialD}" inputmode="numeric" />
                </label>
            </div>
            <div class="details">
                <input type="text" class="title-input" placeholder="Enter title..." value="Progress Item ${instances.length + 1}" />
                <textarea class="description" placeholder="Add a description...">Track your progress here...</textarea>
            </div>
            <button class="removeBtn" type="button" aria-label="Remove progress">Remove</button>
        `;
        return item;
    }

    // Initialize all existing progress-item elements
    const roots = Array.from(document.querySelectorAll('.progress-item'));
    roots.forEach(r => {
        const inst = initProgressComponent(r);
        if(inst) instances.push(inst);
    });

    // Add-progress button handler
    const addBtn = document.getElementById('addProgressBtn');
    const list = document.getElementById('progressList');
    if(addBtn && list){
        addBtn.addEventListener('click', ()=>{
            const newItem = createProgressItem(0,1);
            list.appendChild(newItem);
            const inst = initProgressComponent(newItem);
            if(inst) instances.push(inst);
            // scroll into view a bit for feedback
            newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // Global helper: set progress for an instance index (default first)
    window.setProgress = function(n, d, idx = 0){
        if(typeof idx !== 'number') idx = 0;
        if(instances[idx] && typeof instances[idx].setProgress === 'function'){
            instances[idx].setProgress(n,d);
        } else {
            console.warn('setProgress: instance not found at index', idx);
        }
    };
})();
// ...existing code...