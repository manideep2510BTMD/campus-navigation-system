/**
 * Dijkstra's Shortest Path Algorithm
 * Finds the minimum-weight path between two nodes in a weighted graph.
 *
 * @param {Object} graph - Adjacency list: { nodeId: [{ node, weight }] }
 * @param {string} startId - Starting node ID
 * @param {string} endId - Destination node ID
 * @returns {{ path, distance, steps } | null}
 */
function dijkstra(graph, startId, endId) {
  const distances = {};
  const prev = {};
  const visited = new Set();
  const nodes = Object.keys(graph);

  // Initialize
  nodes.forEach(node => {
    distances[node] = Infinity;
    prev[node] = null;
  });
  distances[startId] = 0;

  while (true) {
    // Pick unvisited node with smallest tentative distance
    let current = null;
    let minDist = Infinity;
    for (const node of nodes) {
      if (!visited.has(node) && distances[node] < minDist) {
        minDist = distances[node];
        current = node;
      }
    }

    if (current === null || current === endId) break;
    visited.add(current);

    // Relax neighbors
    for (const { node, weight } of (graph[current] || [])) {
      if (!visited.has(node)) {
        const candidate = distances[current] + weight;
        if (candidate < distances[node]) {
          distances[node] = candidate;
          prev[node] = current;
        }
      }
    }
  }

  // Reconstruct path by backtracking from end to start
  const path = [];
  let cur = endId;
  while (cur !== null) {
    path.unshift(cur);
    cur = prev[cur];
  }

  // No path found
  if (path[0] !== startId) return null;

  return {
    path,
    distance: distances[endId],
    steps: path.length - 1
  };
}

/**
 * BFS - finds path with fewest hops (unweighted)
 * Useful for comparison / alternative route display.
 */
function bfs(graph, startId, endId) {
  const queue = [[startId]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];
    if (node === endId) return path;
    for (const { node: neighbor } of (graph[node] || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

module.exports = { dijkstra, bfs };
