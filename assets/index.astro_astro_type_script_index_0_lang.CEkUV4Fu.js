function e(e={}){let t={...e},n=new Set;return{getState:()=>t,setState:e=>{t={...t,...e},n.forEach(e=>e(t))},subscribe:e=>(n.add(e),()=>n.delete(e))}}function t(e,t,n){if(e.some(e=>e.anilist_id===t.anilist_id))throw Error(`Anime with this anilist_id already exists in the watchlist`);let r={...t,watched_by:[n]};return[...e,r]}function n(e,t){return e.filter(e=>e.anilist_id!==t)}function r(e,t,n){let r=e.findIndex(e=>e.anilist_id===t);if(r===-1)throw Error(`Anime with anilist_id ${t} not found`);let i=e[r],a=i.watched_by||[],o=a.includes(n),s={...i,watched_by:o?a.filter(e=>e!==n):[...a,n]},c=[...e];return c[r]=s,c}function i(e,t,n,r){if(r<1||r>10)throw Error(`Rating must be between 1 and 10`);let i=e.findIndex(e=>e.anilist_id===t);if(i===-1)throw Error(`Anime with anilist_id ${t} not found`);let a=e[i],o=a.ratings||[],s=o.findIndex(e=>e.user===n),c;s===-1?c=[...o,{user:n,score:r}]:(c=[...o],c[s]={user:n,score:r});let l={...a,ratings:c},u=[...e];return u[i]=l,u}function a(e,t){return e.filter(e=>{if(t.query){let n=t.query.toLowerCase();if(![e.title_romaji,e.title_english,e.title_de].filter(Boolean).map(e=>e.toLowerCase()).some(e=>e.includes(n)))return!1}if(t.genres&&t.genres.length>0&&(!e.genres||!e.genres.some(e=>t.genres.includes(e)))||t.minScore!==void 0&&t.minScore!==null&&e.average_score!==void 0&&e.average_score!==null&&e.average_score<t.minScore)return!1;if(t.minPersonalRating!==void 0&&t.minPersonalRating!==null&&t.personalRatingUser){if(!e.ratings)return!1;let n=e.ratings.find(e=>e.user===t.personalRatingUser);if(!n||n.score<t.minPersonalRating)return!1}if(t.watchedBy){if(!e.watched_by||e.watched_by.length===0)return!1;if(t.watchedBy===`all`||t.watchedBy===`both`){if(!e.watched_by.includes(`chrischi`)||!e.watched_by.includes(`michelle`))return!1}else if(!e.watched_by.includes(t.watchedBy))return!1}return!0})}function o(e){let t=new Set;for(let n of e)if(n.genres)for(let e of n.genres)t.add(e);return[...t].sort()}function s(e,o){function s(){o.saveWatchlist(e.getState().watchlist)}return{addAnimeToList(n,r){let{watchlist:i}=e.getState(),a=t(i,{...n},r);e.setState({watchlist:a}),s()},removeAnimeFromList(t){let{watchlist:r}=e.getState(),i=n(r,t);e.setState({watchlist:i}),s()},toggleViewer(t,n){let{watchlist:i}=e.getState(),a=r(i,t,n);e.setState({watchlist:a}),s()},updateRating(t,n,r){let{watchlist:a}=e.getState(),o=i(a,t,n,r);e.setState({watchlist:o}),s()},setFilters(t){e.setState({filters:t})},getFilteredWatchlist(){let{watchlist:t,filters:n}=e.getState();return a(t,n||{})},exportDownload(){let{watchlist:t}=e.getState();c(o.exportWatchlist(t),`anime.json`)}}}function c(e,t){let n=new Blob([e],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=t,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)}var l=`anime-tracker-users`;function u(){return`u_`+Math.random().toString(36).substring(2,8)}function d(){let e=u(),t=u();return{users:[e,t],labels:{[e]:`User 1`,[t]:`User 2`},defaultUser:e,generated:!0}}var f=null,p=typeof localStorage>`u`;function m(){if(f)return f;if(p)return f={users:[`user_1`,`user_2`],labels:{user_1:`User 1`,user_2:`User 2`},defaultUser:`user_1`,generated:!0},f;try{let e=localStorage.getItem(l);if(!e)return f=d(),localStorage.setItem(l,JSON.stringify(f)),f;let t=JSON.parse(e);if(!t.generated&&t.users[0]===`chrischi`&&t.users[1]===`michelle`){let e=d();return e.labels[e.users[0]]=t.labels?.chrischi||`User 1`,e.labels[e.users[1]]=t.labels?.michelle||`User 2`,localStorage.setItem(l,JSON.stringify(e)),f=e,f}return f=t,f}catch{return f=d(),localStorage.setItem(l,JSON.stringify(f)),f}}function h(){return m().users}function g(){return m().labels}function _(){return m().defaultUser}function v(e){return m().labels[e]||e}function y(e,t,n){f={users:e,labels:t,defaultUser:n},p||localStorage.setItem(l,JSON.stringify(f))}function b(e){let t=e.title_de||e.title_english||e.title_romaji,n=t!==e.title_romaji,r=(e.genres||[]).slice(0,4),i=r.length?`<div class="anime-card-genres anime-genres">${r.map(e=>`<span class="genre-tag">${w(e)}</span>`).join(``)}</div>`:``,a=e.average_score,o=a==null?``:`<span class="anime-score ${a>=75?`score-high`:a>=50?`score-mid`:`score-low`}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"/></svg> ${a}</span>`,s=e.episodes==null?``:`<span class="anime-episodes">${e.episodes} Ep.</span>`,c=e.format?`<span class="anime-format">${w(e.format)}</span>`:``,l=e.watched_by||[],u=``;if(l.length===2)u=`<div class="watched-badges"><span class="watched-badge badge-both"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="10" height="10"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"/></svg> Beide</span></div>`;else if(l.length===1){let e=l[0];u=`<div class="watched-badges"><span class="watched-badge ${e===h()[0]?`badge-chrischi`:`badge-michelle`}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="10" height="10"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/></svg> ${e===h()[0]?v(h()[0]):v(h()[1])}</span></div>`}let d=(e.ratings||[]).filter(t=>e.watched_by?.includes(t.user)),f=d.length?`<div class="personal-ratings">${d.map(e=>T(e.user,e.score)).join(``)}</div>`:``,p=e.cover_url?`<img class="anime-cover anime-card-cover" src="${w(e.cover_url)}" alt="${w(t)}" loading="lazy" />`:`<div class="anime-cover-placeholder anime-card-cover-placeholder">${E()}</div>`,m=`<div class="anime-card-actions anime-actions">
    <button class="btn-icon btn-icon-sm" data-action="toggle-${h()[0]}" data-id="${e.anilist_id}" title="${v(h()[0])} gesehen umschalten">${D(14)}</button>
    <button class="btn-icon btn-icon-sm" data-action="toggle-${h()[1]}" data-id="${e.anilist_id}" title="${v(h()[1])} gesehen umschalten">${D(14)}</button>
    <button class="btn-icon btn-icon-sm" data-action="remove" data-id="${e.anilist_id}" title="Entfernen">${O(14)}</button>
  </div>`;return`<div class="anime-card" data-id="${e.anilist_id}">
    ${p}
    <div class="anime-card-body anime-info">
      <span class="anime-card-title anime-title">${w(t)}</span>
      ${n?`<span class="anime-card-title-de anime-title-de">${w(e.title_romaji)}</span>`:``}
      ${i}
      <div class="anime-card-meta anime-meta">
        ${o}
        ${c}
        ${s}
        ${u}
      </div>
      ${f}
      ${m}
    </div>
  </div>`}function x(e){let t=(e.genres||[]).slice(0,3),n=t.length?`<div class="search-result-genres">${t.map(e=>`<span class="genre-tag">${w(e)}</span>`).join(``)}</div>`:``,r=e.cover_url?`<img class="search-result-cover" src="${w(e.cover_url)}" alt="${w(e.title_romaji)}" loading="lazy" />`:`<div class="search-result-placeholder">${E()}</div>`,i=e.average_score==null?`<span class="search-result-score">-</span>`:`<span class="search-result-score"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"/></svg> ${e.average_score}</span>`,a=e.episodes==null?``:`<span class="search-result-episodes">${e.episodes} Episoden</span>`,o=e.title_english&&e.title_english!==e.title_romaji?`<span class="search-result-title-en">${w(e.title_english)}</span>`:``;return`<div class="search-result" data-id="${e.anilist_id}">
    ${r}
    <div class="search-result-info">
      <span class="search-result-title">${w(e.title_romaji)}</span>
      ${o}
      ${n}
      <div class="search-result-meta">
        ${i}
        ${a}
      </div>
    </div>
  </div>`}function S(e,t){let n=e.genres||[],r=e.minScore||0,i=e.watchedBy||``;return`<div class="filter-overlay" id="filter-overlay"></div>
  <div class="filter-panel" id="filter-panel">
    <div class="filter-panel-header">
      <span class="filter-panel-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.166a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clip-rule="evenodd"/></svg> Filter</span>
      <button class="filter-panel-close" id="filter-panel-close" aria-label="Schließen"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg></button>
    </div>

    <div class="filter-panel-section">
      <span class="filter-panel-label">Genre</span>
      <div class="filter-genre-tags" id="filter-genre-tags">
        ${t.map(e=>{let t=n.includes(e)?`active`:``,r=t?`✓`:``;return`<span class="filter-genre-tag ${t}" data-genre="${w(e)}">${r?`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> `:``}${w(e)}</span>`}).join(``)}
      </div>
    </div>

    <div class="filter-panel-section">
      <span class="filter-panel-label">Bewertung ≥ <span id="filter-score-value">${r}</span></span>
      <div class="filter-range-wrapper">
        <input type="range" id="filter-score" class="filter-range" min="0" max="100" value="${r}" step="1" />
        <span class="filter-range-value" id="filter-score-display">${r}</span>
      </div>
    </div>

    <div class="filter-panel-section">
      <span class="filter-panel-label">Gesehen von</span>
      <div class="filter-who-toggle" id="filter-who-toggle">
        <button class="filter-who-btn ${i===`both`?`active`:``}" data-who="both">👥 Beide</button>
        ${h().map(e=>`<button class="filter-who-btn ${i===e?`active`:``}" data-who="${e}">${v(e)}</button>`).join(``)}
      </div>
    </div>

    <div class="filter-actions">
      <button class="filter-btn filter-btn-secondary" id="filter-reset">Zurücksetzen</button>
      <button class="filter-btn filter-btn-primary" id="filter-apply">Anwenden</button>
    </div>
  </div>`}function C(e){let t=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.166a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clip-rule="evenodd"/></svg>`;return e>0?`<span class="filter-summary-icon">${t}</span>
      <span class="filter-summary-text">Filter</span>
      <span class="filter-summary-active">${e} aktiv</span>
      <span class="filter-summary-reset" id="filter-summary-reset">Zurücksetzen</span>`:`<span class="filter-summary-icon">${t}</span>
    <span class="filter-summary-text">Filter</span>`}function w(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/\"/g,`&quot;`).replace(/'/g,`&#039;`)}function T(e,t){let n=`★`.repeat(t),r=`☆`.repeat(10-t);return`<span class="personal-rating">
    <span class="rating-name">${w(v(e))}:</span>
    <span class="star">${n}</span><span class="star-empty">${r}</span>
  </span>`}function E(){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="32" height="32"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/></svg>`}function D(e){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="${e}" height="${e}"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/></svg>`}function O(e){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="${e}" height="${e}"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c-.84 0-1.673.025-2.5.075V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.325C11.673 4.025 10.84 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/></svg>`}function k(e){document.title=e>0?`(${e}) Anime Tracker`:`Anime Tracker`}function A(e,t,n){let r=null,i=null,a=null;function s(){let{watchlist:n,deTitles:r,filters:i}=e.getState(),a=document.getElementById(`anime-grid`);if(document.getElementById(`filter-summary`),!a)return;let s=t.getFilteredWatchlist();if(a.innerHTML=``,n.length===0){let e=document.createElement(`div`);e.className=`anime-grid-empty`,e.innerHTML=`
        <div class="anime-grid-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="32" height="32"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/></svg></div>
        <p class="anime-grid-empty-text">Noch keine Animes in der Sammlung.</p>
        <p class="anime-grid-empty-sub">Tippe auf +, um zu starten.</p>
      `,a.appendChild(e)}else if(s.length===0){let e=document.createElement(`div`);e.className=`anime-grid-empty`,e.innerHTML=`
        <div class="anime-grid-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="32" height="32"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg></div>
        <p class="anime-grid-empty-text">Keine Treffer</p>
        <p class="anime-grid-empty-sub">Versuche andere Filter.</p>
      `,a.appendChild(e)}else a.innerHTML=s.map(e=>b(e,r)).join(``);c(n),l(i);let f=o(n);if(u(f,i),document.getElementById(`filter-panel`)){let e=document.getElementById(`filter-sheet-container`);e&&(e.innerHTML=S(i,f),m())}d(i,f)}function c(e){let t=document.getElementById(`stats`);if(!t)return;let n=e.filter(e=>e.watched_by&&e.watched_by.includes(h()[0])&&e.watched_by.includes(h()[1])).length,r=`
      <div class="stat-card stat-total">
        <span class="stat-card-number" id="total-count">${e.length}</span>
        <span class="stat-card-label">Gesamt</span>
      </div>
      <div class="stat-card stat-both">
        <span class="stat-card-number" id="both-count">${n}</span>
        <span class="stat-card-label">Gemeinsam</span>
      </div>`;h().forEach(t=>{let n=e.filter(e=>e.watched_by?.includes(t)).length;r+=`
        <div class="stat-card stat-${t}">
          <span class="stat-card-number">${n}</span>
          <span class="stat-card-label">${v(t)}</span>
        </div>`}),t.innerHTML=r}function l(e){let t=document.getElementById(`filter-summary`);if(!t)return;let n=0;e.genres&&e.genres.length>0&&n++,e.minScore&&e.minScore>0&&n++,e.watchedBy&&n++,e.query&&n++,t.innerHTML=C(n)}function u(e,t){let n=document.getElementById(`filter-genre-tags`);if(!n)return;let r=t.genres||[];n.innerHTML=e.map(e=>`<span class="filter-genre-tag ${r.includes(e)?`active`:``}" data-genre="${e}">${e}</span>`).join(``)}function d(e,t){let n=document.getElementById(`filter-desktop-bar`);if(!n)return;let r=e.genres||[],i=e.minScore||0,a=e.watchedBy||``,o=t.map(e=>`<span class="filter-genre-tag ${r.includes(e)?`active`:``}" data-genre="${e}">${e}</span>`).join(``),s=h().map(e=>`<button class="filter-who-btn ${a===e?`active`:``}" data-who="${e}">${v(e)}</button>`).join(``);n.innerHTML=`
      <div class="filter-desktop-inner">
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Genre</span>
          <div class="filter-genre-tags" id="filter-genre-tags-desktop">
            ${o}
          </div>
        </div>
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Score ≥ ${i}</span>
          <input type="range" class="filter-range" id="filter-score-desktop" min="0" max="100" value="${i}" step="1" />
        </div>
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Gesehen von</span>
          <div class="filter-who-toggle">
            <button class="filter-who-btn ${a===`both`?`active`:``}" data-who="both">Beide</button>
            ${s}
          </div>
        </div>
      </div>
    `,w()}function f(){s(),e.subscribe(()=>{s(),k(e.getState().watchlist.length)});let n=document.getElementById(`btn-add-anime`);n&&n.addEventListener(`click`,O);let r=document.getElementById(`btn-add-anime-desktop`);r&&r.addEventListener(`click`,O);let i=document.getElementById(`btn-export`);i&&i.addEventListener(`click`,()=>t.exportDownload());let a=document.getElementById(`btn-random`);a&&a.addEventListener(`click`,j);let o=document.getElementById(`btn-settings`);o&&o.addEventListener(`click`,N);let c=document.getElementById(`btn-export-desktop`);c&&c.addEventListener(`click`,()=>t.exportDownload());let l=document.getElementById(`filter-summary`);l&&l.addEventListener(`click`,e=>{if(e.target.closest(`#filter-summary-reset`)){e.stopPropagation(),t.setFilters({});return}p()});let u=document.getElementById(`anime-grid`);u&&u.addEventListener(`click`,n=>{let r=n.target.closest(`[data-action]`);if(r){let n=r.dataset.action,i=Number(r.dataset.id);if(isNaN(i))return;if(n===`remove`){let n=e.getState().watchlist.find(e=>e.anilist_id===i);t.removeAnimeFromList(i),A(n,i)}else if(n===`toggle-${h()[0]}`||n===`toggle-${h()[1]}`){let e=n.replace(`toggle-`,``);t.toggleViewer(i,e)}return}let i=n.target.closest(`.anime-card`);if(i){let e=Number(i.dataset.id);isNaN(e)||M(e)}})}function p(){let t=document.getElementById(`filter-sheet-container`);if(!t)return;let{watchlist:n,filters:r}=e.getState();t.innerHTML=S(r,o(n)),m()}function m(){let n=document.getElementById(`filter-panel-close`);n&&n.addEventListener(`click`,E);let r=document.getElementById(`filter-overlay`);r&&r.addEventListener(`click`,E);let i=document.getElementById(`filter-genre-tags`);i&&i.addEventListener(`click`,e=>{let t=e.target.closest(`.filter-genre-tag`);if(!t)return;t.classList.toggle(`active`);let n=t.querySelector(`svg`);t.classList.contains(`active`)?n||t.insertAdjacentHTML(`afterbegin`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> `):n&&n.remove()});let a=document.getElementById(`filter-score`),o=document.getElementById(`filter-score-display`),s=document.getElementById(`filter-score-value`);a&&o&&a.addEventListener(`input`,()=>{let e=a.value;o.textContent=e,s&&(s.textContent=e)});let c=document.getElementById(`filter-who-toggle`);c&&c.addEventListener(`click`,e=>{let t=e.target.closest(`.filter-who-btn`);if(!t)return;let n=t.classList.contains(`active`);c.querySelectorAll(`.filter-who-btn`).forEach(e=>e.classList.remove(`active`)),n||t.classList.add(`active`)});let l=document.getElementById(`filter-apply`);l&&l.addEventListener(`click`,()=>{let n=document.querySelectorAll(`#filter-genre-tags .filter-genre-tag.active`),r=Array.from(n).map(e=>e.dataset.genre),i=document.getElementById(`filter-score`),a=i?Number(i.value):0,o=document.querySelector(`#filter-who-toggle .filter-who-btn.active`),s=o?o.dataset.who:``,c={...e.getState().filters};r.length>0?c.genres=r:delete c.genres,a>0?c.minScore=a:delete c.minScore,s?c.watchedBy=s:delete c.watchedBy,t.setFilters(c),E()});let u=document.getElementById(`filter-reset`);u&&u.addEventListener(`click`,()=>{t.setFilters({}),E()})}function w(){let e=document.getElementById(`filter-genre-tags-desktop`);e&&e.addEventListener(`click`,e=>{let t=e.target.closest(`.filter-genre-tag`);t&&(t.classList.toggle(`active`),T())});let t=document.getElementById(`filter-score-desktop`);t&&t.addEventListener(`input`,()=>{T()});let n=document.querySelector(`#filter-desktop-bar .filter-who-toggle`);n&&n.addEventListener(`click`,e=>{let t=e.target.closest(`.filter-who-btn`);if(!t)return;let r=t.classList.contains(`active`);n.querySelectorAll(`.filter-who-btn`).forEach(e=>e.classList.remove(`active`)),r||t.classList.add(`active`),T()})}function T(){let n=document.querySelectorAll(`#filter-genre-tags-desktop .filter-genre-tag.active`),r=Array.from(n).map(e=>e.dataset.genre),i=document.getElementById(`filter-score-desktop`),a=i?Number(i.value):0,o=document.querySelector(`#filter-desktop-bar .filter-who-btn.active`),s=o?o.dataset.who:``,c={...e.getState().filters};r.length>0?c.genres=r:delete c.genres,a>0?c.minScore=a:delete c.minScore,s?c.watchedBy=s:delete c.watchedBy,t.setFilters(c)}function E(){let e=document.getElementById(`filter-sheet-container`);e&&(e.innerHTML=``)}let D=null;function O(){let o=document.getElementById(`search-modal-container`);if(!o)return;i=null,a=null,o.innerHTML=`
      <div class="search-overlay" id="modal-overlay">
        <div class="search-header">
          <button class="search-close" id="modal-close" aria-label="Schließen"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg></button>
          <div class="search-input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>
            <input
              type="text"
              id="modal-search-input"
              class="search-input"
              placeholder="Anime suchen…"
              autocomplete="off"
              autofocus
            />
          </div>
        </div>
        <div class="search-genre-wrapper">
          <div class="search-filter-row">
            <select id="modal-search-genre" class="search-genre-select search-filter-half">
              <option value="">🎭 Genre</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Horror">Horror</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Slice of Life">Slice of Life</option>
              <option value="Sports">Sports</option>
              <option value="Thriller">Thriller</option>
              <option value="Ecchi">Ecchi</option>
            </select>
            <select id="modal-search-tag" class="search-genre-select search-filter-half">
              <option value="">🏷️ Tag</option>
              <option value="Isekai">Isekai</option>
              <option value="Mecha">Mecha</option>
              <option value="Harem">Harem</option>
              <option value="Psychological">Psychological</option>
              <option value="Supernatural">Supernatural</option>
              <option value="Shounen">Shounen</option>
              <option value="Seinen">Seinen</option>
              <option value="Shoujo">Shoujo</option>
              <option value="Josei">Josei</option>
              <option value="Music">Music</option>
            </select>
          </div>
          <div class="search-filter-row" style="margin-top:var(--space-2)">
            <select id="modal-search-sort" class="search-genre-select">
              <option value="relevance">📊 Relevanz</option>
              <option value="score_desc">⭐ Bewertung ↓</option>
              <option value="score_asc">⭐ Bewertung ↑</option>
              <option value="title_asc">📝 Titel A–Z</option>
              <option value="title_desc">📝 Titel Z–A</option>
              <option value="popularity">🔥 Beliebteste</option>
            </select>
          </div>
        </div>
        <div class="search-results" id="modal-search-results"></div>
        <div class="search-who" id="modal-who">
          <span class="search-who-label">Gesehen von:</span>
          ${h().map(e=>`<label class="search-who-checkbox">
        <input type="checkbox" value="${e}" checked />
        ${v(e)}
      </label>`).join(``)}
        </div>
        <div class="search-actions">
          <button class="btn btn-secondary" id="modal-cancel">Abbrechen</button>
          <button class="btn btn-primary" id="modal-add" disabled>Hinzufügen</button>
        </div>
      </div>
    `;let s=document.getElementById(`modal-overlay`),c=document.getElementById(`modal-search-input`),l=document.getElementById(`modal-search-results`),u=document.getElementById(`modal-add`),d=document.getElementById(`modal-cancel`),f=document.getElementById(`modal-close`),p=document.querySelectorAll(`#modal-who input[type="checkbox"]`),m=document.getElementById(`modal-search-genre`),g=document.getElementById(`modal-search-tag`),y=document.getElementById(`modal-search-sort`);function b(){let e=c?.value||``,t=m?.value||``,n=g?.value||``,r=y?.value||`relevance`;(e||t||n)&&(D={query:e,genre:t,tag:n,sort:r}),o.innerHTML=``,i=null,a=null}if(f&&f.addEventListener(`click`,b),d&&d.addEventListener(`click`,b),s&&s.addEventListener(`click`,e=>{e.target===s&&b()}),D){let e=D;c&&e.query&&(c.value=e.query),m&&e.genre&&(m.value=e.genre),g&&e.tag&&(g.value=e.tag),y&&e.sort&&(y.value=e.sort),setTimeout(()=>A(!0),100)}let S=1,C=!1,w=[],T=``,E=``,O=``,k=`relevance`;async function A(t=!0){let r=c?c.value.trim():``,a=document.getElementById(`modal-search-genre`),o=a?a.value:``,s=document.getElementById(`modal-search-tag`),u=s?s.value:``,d=document.getElementById(`modal-search-sort`),f=d?d.value:`relevance`;if(t&&(S=1,w=[],T=r,E=o,O=u,k=f),!T&&!E&&!O){l.innerHTML=``,i=null;return}if(t)l.innerHTML=`<div class="search-loading">Suche…</div>`;else{let e=l.querySelector(`.search-load-more`);e&&(e.innerHTML=`<span class="search-loading" style="padding:12px">Lade…</span>`)}try{let r=await n.searchAnimePage(T,E||void 0,O||void 0,S,k),a=r.results||[];w=t?a:[...w,...a],C=r.hasNextPage,i=w,S=r.currentPage+1;let o=w.map(x).join(``),s=new Set(e.getState().watchlist.map(e=>e.anilist_id));w.forEach(e=>{if(s.has(e.anilist_id)){let t=l.querySelector(`.search-result[data-id="${e.anilist_id}"]`);t&&(t.classList.add(`already-added`),t.querySelector(`.search-result-info`)?.insertAdjacentHTML(`beforeend`,`<span class="already-added-badge">✅ Bereits in Sammlung</span>`))}}),C&&(o+=`<div class="search-load-more" id="search-load-more"><button class="btn btn-secondary" id="btn-load-more" style="width:100%;justify-content:center">📄 Mehr laden</button></div>`),l.innerHTML=o||`<div class="search-no-results">Keine Ergebnisse gefunden.</div>`;let c=document.getElementById(`btn-load-more`);c&&c.addEventListener(`click`,()=>A(!1))}catch{l.innerHTML=`<div class="search-error">Fehler bei der Suche.</div>`}}c&&c.addEventListener(`input`,()=>{clearTimeout(r),r=setTimeout(()=>A(!0),300)}),m&&m.addEventListener(`change`,()=>A(!0)),g&&g.addEventListener(`change`,()=>A(!0)),y&&y.addEventListener(`change`,()=>A(!0)),l&&l.addEventListener(`click`,e=>{let t=e.target.closest(`.search-result`);if(!t)return;let n=Number(t.dataset.id);if(isNaN(n))return;if(l.querySelectorAll(`.search-result`).forEach(e=>e.classList.remove(`selected`)),t.classList.contains(`already-added`)){u&&(u.disabled=!0);return}t.classList.add(`selected`),a=n,u&&(u.disabled=!1);let r=document.getElementById(`modal-de-title-wrapper`);r&&(r.style.display=`block`);let o=i?.find(e=>e.anilist_id===n),s=document.getElementById(`modal-de-title-input`);s&&o&&(s.placeholder=`Optional — ${o.title_english||o.title_romaji}`)}),u&&u.addEventListener(`click`,()=>{if(a===null||!i)return;let e=i.find(e=>e.anilist_id===a);if(!e)return;let n=[];p.forEach(e=>{e.checked&&n.push(e.value)});let r=n.length>0?n[0]:_(),o={anilist_id:e.anilist_id,title_romaji:e.title_romaji,title_english:e.title_english,genres:e.genres,average_score:e.average_score,episodes:e.episodes,format:e.format,cover_url:e.cover_url};try{t.addAnimeToList(o,r);let i=document.getElementById(`modal-de-title-input`),a=i?i.value.trim():``;a&&t.updateDeTitles({[e.anilist_id]:a}),n.length>=2&&t.toggleViewer(e.anilist_id,n[1])}catch(e){l.innerHTML=`<div class="search-error">Fehler: ${e.message}</div>`;return}b()}),c&&setTimeout(()=>c.focus(),50)}function A(e,n){let r=document.getElementById(`undo-toast`);r&&r.remove();let i=document.createElement(`div`);i.id=`undo-toast`,i.innerHTML=`<span>🗑️ Gelöscht</span><button id="undo-btn" style="color:var(--color-primary);font-weight:700;background:none;border:none;cursor:pointer;padding:4px 8px">Rückgängig</button>`,Object.assign(i.style,{position:`fixed`,bottom:`90px`,left:`50%`,transform:`translateX(-50%)`,background:`var(--color-card)`,border:`1px solid var(--color-border)`,borderRadius:`var(--radius)`,padding:`12px 20px`,zIndex:`300`,display:`flex`,alignItems:`center`,gap:`16px`,fontSize:`0.9rem`,boxShadow:`var(--shadow-lg)`,animation:`slideUp 0.3s ease`}),document.body.appendChild(i),document.getElementById(`undo-btn`).addEventListener(`click`,()=>{t.addAnimeToList(e,_()),e.watched_by?.includes(h()[1])&&t.toggleViewer(n,h()[1]),i.remove()}),setTimeout(()=>i.remove(),4e3)}function j(){let r=document.getElementById(`search-modal-container`);if(!r)return;r.innerHTML=`
      <div class="search-overlay" id="random-overlay" style="justify-content:center;align-items:center">
        <div style="background:var(--color-card);border-radius:var(--radius);padding:32px;text-align:center;border:1px solid var(--color-border)">
          <div class="loader-spinner" style="margin:0 auto 16px"></div>
          <p style="color:var(--color-muted-foreground)">🎲 Suche zufälligen Anime…</p>
        </div>
      </div>`;async function i(){for(let e=0;e<10;e++){let e=Math.floor(Math.random()*5e4)+1;try{let t=await n.getAnimeById(e);if(t){a(t);return}}catch{}}r.innerHTML=`
        <div class="search-overlay" id="random-overlay" style="justify-content:center;align-items:center">
          <div style="background:var(--color-card);border-radius:var(--radius);padding:24px;text-align:center;border:1px solid var(--color-border)">
            <p style="margin-bottom:12px">😕 Kein Anime gefunden. Nochmal versuchen?</p>
            <button id="random-retry" class="btn btn-primary" style="width:100%">🎲 Erneut versuchen</button>
            <button id="random-close-fail" class="btn btn-secondary" style="width:100%;margin-top:8px">Schließen</button>
          </div>
        </div>`,document.getElementById(`random-retry`).onclick=()=>{r.innerHTML=``,setTimeout(i,50)},document.getElementById(`random-close-fail`).onclick=()=>{r.innerHTML=``}}function a(n){let a=n.title_english||n.title_romaji,o=e.getState().watchlist.some(e=>e.anilist_id===n.anilist_id);if(r.innerHTML=`
      <div class="search-overlay" id="random-overlay" style="overflow-y:auto">
        <div style="background:var(--color-card);border-radius:var(--radius);margin:auto;max-width:400px;width:90%;margin-top:24px;margin-bottom:24px;border:1px solid var(--color-border);overflow:hidden">
          ${n.cover_url?`<img src="${n.cover_url}" alt="" style="width:100%;aspect-ratio:3/4;object-fit:cover;max-height:250px;object-position:top" />`:``}
          <div style="padding:20px;text-align:center">
            <h3 style="font-size:1.2rem;margin-bottom:4px">${a}</h3>
            <div style="color:var(--color-muted-foreground);font-size:0.85rem;margin-bottom:8px">${n.title_romaji}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-bottom:8px">
              ${(n.genres||[]).slice(0,4).map(e=>`<span class="genre-tag">${e}</span>`).join(``)}
            </div>
            <div style="display:flex;justify-content:center;gap:16px;font-size:0.9rem;margin-bottom:16px">
              <span>⭐ ${n.average_score||`–`}%</span>
              <span>📺 ${n.format||`–`}</span>
              <span>📺 ${n.episodes||`?`} Ep.</span>
            </div>`+(n.description?`<div style="font-size:0.85rem;color:var(--color-muted-foreground);line-height:1.5;max-height:80px;overflow-y:auto;margin-bottom:16px;text-align:left">${n.description.slice(0,300)}${n.description.length>300?`…`:``}</div>`:``)+(o?`<div style="color:var(--color-success);font-weight:600;margin-bottom:12px">✅ Bereits in der Sammlung</div>`:`<div style="border-top:1px solid var(--color-border);padding-top:12px;margin-bottom:12px">
                <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:8px;font-weight:600">Gesehen von:</div>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                  ${h().map(e=>`
                    <label class="search-who-checkbox" style="font-size:0.85rem">
                      <input type="checkbox" class="random-who-cb" value="${e}" checked /> ${v(e)}
                    </label>
                  `).join(``)}
                </div>
              </div>
              <button id="random-add" class="btn btn-primary" style="width:100%">➕ Zur Sammlung hinzufügen</button>`)+`<button id="random-close" class="btn btn-secondary" style="width:100%;margin-top:8px">Schließen</button>
            <button id="random-another" style="margin-top:8px;width:100%;padding:8px;background:none;color:var(--color-muted-foreground);border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:0.85rem">🎲 Nächster Zufalls-Anime</button>
          </div>
        </div>
      </div>`,document.getElementById(`random-close`).onclick=()=>{r.innerHTML=``},document.getElementById(`random-overlay`).addEventListener(`click`,e=>{e.target===e.currentTarget&&(r.innerHTML=``)}),document.getElementById(`random-another`).onclick=()=>{r.innerHTML=``,setTimeout(i,50)},!o){let e=document.getElementById(`random-add`);e&&e.addEventListener(`click`,()=>{let e=[];if(document.querySelectorAll(`.random-who-cb:checked`).forEach(t=>e.push(t.value)),e.length===0){alert(`Bitte mindestens eine Person auswählen.`);return}let i={anilist_id:n.anilist_id,title_romaji:n.title_romaji,title_english:n.title_english,genres:n.genres,average_score:n.average_score,episodes:n.episodes,format:n.format,cover_url:n.cover_url};try{t.addAnimeToList(i,e[0]),e.length>=2&&t.toggleViewer(n.anilist_id,e[1]),r.innerHTML=``}catch(e){alert(`Fehler: `+e.message)}})}}i()}function M(n){let{watchlist:r}=e.getState(),i=r.find(e=>e.anilist_id===n);if(!i)return;let a=i.title_de||i.title_english||i.title_romaji,o=document.getElementById(`search-modal-container`);if(!o)return;let s=h().map(e=>{let t=i.watched_by?.includes(e),n=t?e===h()[0]?`var(--color-secondary)`:`var(--color-success)`:`var(--color-muted)`,r=t?`white`:`var(--color-muted-foreground)`;return`<button class="detail-who-btn ${t?`active`:``}" data-id="${i.anilist_id}" data-user="${e}" style="padding:6px 16px;border-radius:999px;border:1px solid var(--color-border);background:${n};color:${r};cursor:pointer;font-size:0.85rem;transition:all 0.2s">🙋 ${v(e)}</button>`}).join(``),c=h().map(e=>{let t=i.ratings?.find(t=>t.user===e)?.score||0,n=t>0?String(t):`–`;return`<div style="flex:1;min-width:140px">
                  <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:2px">${v(e)}: <span id="detail-rating-${e}">${n}</span>/10</div>
                  <input type="range" min="0" max="10" value="${t}" class="detail-rating-slider" data-user="${e}" data-id="${i.anilist_id}" style="width:100%" />
                </div>`}).join(``);o.innerHTML=`
      <div class="search-overlay" id="detail-overlay" style="overflow-y:auto">
        <div style="background:var(--color-card);border-radius:var(--radius);margin:auto;max-width:480px;width:90%;margin-top:24px;margin-bottom:24px;border:1px solid var(--color-border);overflow:hidden">
          ${i.cover_url?`<img src="${i.cover_url}" alt="" style="width:100%;aspect-ratio:3/4;object-fit:cover;max-height:300px;object-position:top" />`:``}
          <div style="padding:20px">
            <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px">${a}</h2>
            <div style="color:var(--color-muted-foreground);font-size:0.85rem;margin-bottom:12px">${i.title_romaji}${i.title_english&&i.title_english!==i.title_romaji?` · ${i.title_english}`:``}</div>

            <!-- Genres + Tags -->
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
              ${(i.genres||[]).map(e=>`<span class="genre-tag">${e}</span>`).join(``)}
            </div>

            <!-- Meta -->
            <div style="display:flex;gap:16px;font-size:0.9rem;margin-bottom:12px;flex-wrap:wrap">
              <span>⭐ ${i.average_score||`–`}% Community</span>
              <span>📺 ${i.format||`–`}</span>
              <span>📺 ${i.episodes||`?`} Ep.</span>
            </div>

            <!-- Gesehen von (editierbar) -->
            <div style="margin-bottom:16px">
              <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:6px;font-weight:600">Gesehen von:</div>
              <div style="display:flex;gap:8px">
                ${s}
              </div>
            </div>

            <!-- Rating (editierbar) -->
            <div style="margin-bottom:16px">
              <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:6px;font-weight:600">Bewertung:</div>
              <div style="display:flex;gap:16px;flex-wrap:wrap">
                ${c}
              </div>
            </div>

            <!-- Synopsis -->
            ${i.description?`<div style="margin-bottom:12px">
              <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:4px;font-weight:600">Synopsis</div>
              <div style="font-size:0.85rem;color:var(--color-muted-foreground);line-height:1.5;max-height:150px;overflow-y:auto">${i.description}</div>
            </div>`:``}

            <button id="detail-close" style="width:100%;padding:10px;background:var(--color-primary);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;margin-top:8px">Schließen</button>
          </div>
        </div>
      </div>`,document.getElementById(`detail-close`).onclick=()=>{o.innerHTML=``},document.getElementById(`detail-overlay`).addEventListener(`click`,e=>{e.target===e.currentTarget&&(o.innerHTML=``)}),document.querySelectorAll(`.detail-who-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let n=Number(e.dataset.id),r=e.dataset.user;t.toggleViewer(n,r);let i=e.classList.toggle(`active`);e.style.background=i?r===h()[0]?`var(--color-secondary)`:`var(--color-success)`:`var(--color-muted)`,e.style.color=i?`white`:`var(--color-muted-foreground)`})}),document.querySelectorAll(`.detail-rating-slider`).forEach(e=>{e.addEventListener(`input`,()=>{let n=Number(e.dataset.id),r=e.dataset.user,i=Number(e.value),a=document.getElementById(`detail-rating-${r}`);a&&(a.textContent=i>0?String(i):`–`),i>0&&t.updateRating(n,r,i)})})}function N(){h(),g(),_();let e=document.getElementById(`search-modal-container`);if(!e)return;function t(){let r=h(),i=g();e.innerHTML=`
      <div class="search-overlay" id="settings-overlay" style="justify-content:center;align-items:center">
        <div style="background:var(--color-card);border-radius:var(--radius);padding:24px;max-width:380px;width:90%;border:1px solid var(--color-border)">
          <h2 style="font-size:1.2rem;margin-bottom:16px">⚙️ Einstellungen</h2>
          <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:12px">
            User-IDs: <code style="color:var(--color-primary)">${r[0]}</code> · <code style="color:var(--color-primary)">${r[1]}</code>
            <button id="settings-generate" style="margin-left:8px;background:none;color:var(--color-accent);border:1px solid var(--color-accent);border-radius:4px;padding:2px 8px;cursor:pointer;font-size:0.75rem">🔄 neu generieren</button>
          </div>
          <label style="display:block;font-size:0.85rem;color:var(--color-muted-foreground);margin-bottom:4px">Name User 1:</label>
          <input id="settings-label-0" class="filter-input" style="margin-bottom:16px;width:100%" value="${i[r[0]]}" placeholder="Name" />
          <label style="display:block;font-size:0.85rem;color:var(--color-muted-foreground);margin-bottom:4px">Name User 2:</label>
          <input id="settings-label-1" class="filter-input" style="margin-bottom:16px;width:100%" value="${i[r[1]]}" placeholder="Name" />
          <div style="display:flex;gap:8px">
            <button id="settings-cancel" class="btn btn-secondary" style="flex:1">Abbrechen</button>
            <button id="settings-save" class="btn btn-primary" style="flex:1">Speichern</button>
          </div>
        </div>
      </div>`,document.getElementById(`settings-overlay`).addEventListener(`click`,e=>{e.target===e.currentTarget&&n()}),document.getElementById(`settings-cancel`).onclick=n,document.getElementById(`settings-generate`).onclick=()=>{let e=document.getElementById(`settings-label-0`).value.trim()||`User 1`,n=document.getElementById(`settings-label-1`).value.trim()||`User 2`,r=h(),i=`u_`+Math.random().toString(36).substring(2,8),a=`u_`+Math.random().toString(36).substring(2,8),o=[i,a],s={[i]:e,[a]:n};P(r,o),y(o,s,i),t()},document.getElementById(`settings-save`).onclick=()=>{let e=document.getElementById(`settings-label-0`).value.trim(),t=document.getElementById(`settings-label-1`).value.trim();if(!e||!t){alert(`Bitte beide Namen ausfüllen.`);return}let r=h();y(r,{[r[0]]:e,[r[1]]:t},_()),n(),s(),k()}}function n(){e.innerHTML=``}t()}function P(t,n){let{watchlist:r}=e.getState(),i=!1,a=r.map(e=>{let r=e;for(let e=0;e<t.length;e++)t[e]!==n[e]&&(r.watched_by?.includes(t[e])&&(r={...r,watched_by:r.watched_by.map(r=>r===t[e]?n[e]:r)},i=!0),r.ratings?.some(n=>n.user===t[e])&&(r={...r,ratings:r.ratings.map(r=>r.user===t[e]?{...r,user:n[e]}:r)},i=!0));return r});i&&e.setState({watchlist:a})}return{init:f,render:s,updateTabTitle:()=>k(e.getState().watchlist.length)}}var j=`anime-tracker-watchlist`,M=class{async loadWatchlist(){try{let e=localStorage.getItem(j);if(!e)return[];let t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}saveWatchlist(e){try{localStorage.setItem(j,JSON.stringify(e))}catch(e){console.error(`Failed to save watchlist to localStorage:`,e)}}exportWatchlist(e){let t=new Date,n=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`;return JSON.stringify({version:1,last_updated:n,watched:e},null,2)}},N=`https://graphql.anilist.co`,P=`
  query ($search: String, $genre: String, $tag: String, $page: Int, $sort: [MediaSort]) {
    Page(page: $page, perPage: 20) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(search: $search, genre: $genre, tag: $tag, sort: $sort, type: ANIME) {
        id
        title { romaji english native }
        genres
        averageScore
        episodes
        format
        coverImage { large }
        description
        tags { name rank }
      }
    }
  }
`,F=`
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      genres
      averageScore
      episodes
      format
      coverImage { large }
      description
      tags { name rank }
    }
  }
`;function I(e){return{anilist_id:e.id,title_romaji:e.title.romaji,title_english:e.title.english,title_native:e.title.native,genres:e.genres,average_score:e.averageScore,episodes:e.episodes,format:e.format,cover_url:e.coverImage?e.coverImage.large:null,description:e.description,tags:e.tags}}async function L(e,t){let n=await fetch(N,{method:`POST`,headers:{"Content-Type":`application/json`,Accept:`application/json`},body:JSON.stringify({query:e,variables:t})});if(!n.ok)throw Error(`AniList API error: ${n.status} ${n.statusText}`);return n.json()}async function R(e,t,n){return(await B(e,t,n,1)).results}var z={relevance:[`SEARCH_MATCH`],score_desc:[`SCORE_DESC`],score_asc:[`SCORE_ASC`],title_asc:[`TITLE_ROMAJI`],title_desc:[`TITLE_ROMAJI_DESC`],popularity:[`POPULARITY_DESC`]};async function B(e,t,n,r=1,i=`relevance`){let a=(e||``).trim();if(!a&&!t&&!n)return{results:[],hasNextPage:!1,currentPage:1};let o={page:r,sort:z[i]||z.relevance};a&&(o.search=a),t&&(o.genre=t),n&&(o.tag=n);let s=await L(P,o);return!s.data||!s.data.Page||!s.data.Page.media?{results:[],hasNextPage:!1,currentPage:r}:{results:s.data.Page.media.map(I),hasNextPage:s.data.Page.pageInfo?.hasNextPage||!1,currentPage:s.data.Page.pageInfo?.currentPage||r}}async function V(e){let t=await L(F,{id:e});return!t.data||!t.data.Media?null:I(t.data.Media)}function H(e){let t=document.getElementById(`boot-debug-wrapper`);if(t){t.style.display=`block`;let n=document.getElementById(`boot-debug`);n&&(n.innerHTML+=`<div style="font-size:12px;padding:2px 4px;border-bottom:1px solid rgba(255,255,255,0.05)">${new Date().toISOString().slice(11,19)} ${e}</div>`)}}async function U(){H(`=== bootstrap() ===`),H(`localStorage-Modus 📦`);let t=e({watchlist:[],filters:{}}),n=new M,r=A(t,s(t,n),{searchAnime:R,searchAnimePage:B,getAnimeById:V});H(`Rufe ui.init() auf...`);try{r.init(),H(`ui.init() ✅`)}catch(e){H(`ui.init() FEHLER: ${e.message}`)}H(`Lade Daten aus localStorage...`);try{let e=await n.loadWatchlist();H(`${e.length} Einträge ✅`),t.setState({watchlist:e})}catch(e){H(`localStorage-Fehler: ${e.message}`)}H(`=== fertig ✅ ===`)}U().catch(e=>console.error(`Bootstrap failed:`,e));