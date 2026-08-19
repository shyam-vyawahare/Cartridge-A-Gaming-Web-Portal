/* ==========================================================================
   CARTRIDGE - DASHBOARD
   Fetches data/games.json, groups entries by category, and renders
   .cartridge-tile markup into the matching grid on dashboard.html.
   ========================================================================== */

(function () {
  "use strict";

  const DATA_PATH = "data/games.json";

  // Maps a game's "category" value to its grid container's id in dashboard.html
  const CATEGORY_GRID_IDS = {
    "puzzle": "puzzle-tiles",
    "brain-teaser": "brain-teaser-tiles",
    "retro": "retro-tiles"
  };

  /**
   * Builds the DOM for a single cartridge tile from a game entry
   */
  function buildTile(game) {
    const tile = document.createElement("a");
    tile.className = "cartridge-tile";
    tile.setAttribute("data-category", game.category);
    tile.setAttribute("href", game.path);

    const thumbnail = document.createElement("img");
    thumbnail.className = "cartridge-tile__thumbnail";
    thumbnail.src = game.thumbnail;
    thumbnail.alt = game.title;
    thumbnail.loading = "lazy";

    const label = document.createElement("p");
    label.className = "cartridge-tile__label";
    label.textContent = game.title;

    tile.appendChild(thumbnail);
    tile.appendChild(label);

    return tile;
  }

  /**
   * Renders a "Coming Soon" placeholder inside an empty category grid
   */
  function renderComingSoon(grid) {
    grid.innerHTML = "";
    const badge = document.createElement("p");
    badge.className = "coming-soon";
    badge.textContent = "Coming Soon";
    grid.appendChild(badge);
  }

  /**
   * Groups the flat games array by category, e.g. { puzzle: [...], "brain-teaser": [...] }
   */
  function groupByCategory(games) {
    return games.reduce(function (groups, game) {
      if (!groups[game.category]) {
        groups[game.category] = [];
      }
      groups[game.category].push(game);
      return groups;
    }, {});
  }

  /**
   * Renders all tiles into their matching grids. Categories with no
   * entries keep/show the "Coming Soon" state instead of an empty grid.
   */
  function renderTiles(games) {
    const grouped = groupByCategory(games);

    Object.keys(CATEGORY_GRID_IDS).forEach(function (category) {
      const grid = document.getElementById(CATEGORY_GRID_IDS[category]);
      if (!grid) return;

      const entries = grouped[category];

      if (!entries || entries.length === 0) {
        renderComingSoon(grid);
        return;
      }

      grid.innerHTML = "";
      entries.forEach(function (game) {
        grid.appendChild(buildTile(game));
      });
    });
  }

  function init() {
    fetch(DATA_PATH)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load " + DATA_PATH + ": " + response.status);
        }
        return response.json();
      })
      .then(renderTiles)
      .catch(function (err) {
        // TODO: replace console warning with a visible fallback UI once
        // an error-state design exists (e.g. "Couldn't load games" message)
        console.warn("Cartridge: could not load game data", err);
      });
  }

  init();
})();
