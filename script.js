onload = function () {
  let curr_data, Places, src, dst;
  const container = document.getElementById("mynetwork");
  const container2 = document.getElementById("mynetwork2");
  const genNew = document.getElementById("generate-graph");
  const solve = document.getElementById("solve");
  const temptext = document.getElementById("temptext");
  const temptext2 = document.getElementById("temptext2");
  const cities = [
    "karachi",
    "islamabad",
    "hyderabad",
    "lahore",
    "mithi",
    "sukkur",
    "faislabad",
    "badin",
    "Rawalpindi",
    "Multan",
    "Gujranwala",
  ];
  // initialise graph options
  const options = {
    edges: {
      labelHighlightBold: true,
      font: {
        size: 15,
      },
    },
    nodes: {
      font: "13px arial red",
      scaling: {
        label: true,
      },
      shape: "icon",
      icon: {
        face: "FontAwesome",
        code: "\uf64f",
        size: 30,
        color: "black",
      },
    },
  };
  //  question graph
  const network = new vis.Network(container);
  network.setOptions(options);
  // output graph
  const network2 = new vis.Network(container2);
  network2.setOptions(options);

  // function createData starts =>
  function createData() {
    Places = Math.floor(Math.random() * 8) + 3;
    let nodes = [];
    for (let i = 1; i <= Places; i++) {
      nodes.push({ id: i, label: cities[i - 1] });
    }
    // vis.js will set graph auto on screen

    nodes = new vis.DataSet(nodes);
    // dataset is builtin keyword in vis.js

    // Creating a graph structure
    let edges = [];
    for (let i = 2; i <= Places; i++) {
      let neighbours = i - Math.floor(Math.random() * Math.min(i - 1, 3) + 1);
      edges.push({
        type: 0,
        from: i,
        to: neighbours,
        color: "orange",
        label: String(Math.floor(Math.random() * 70) + 31),
      });
    }
    // Randomly adding new edges to graph
    for (let i = 1; i <= Places / 2; ) {
      let num1 = Math.floor(Math.random() * Places) + 1;
      let num2 = Math.floor(Math.random() * Places) + 1;
      if (num1 !== num2) {
        if (num1 < num2) {
          // data swape
          let tmp = num1;
          num1 = num2;
          num2 = tmp;
        }
        let works = 0;
        // Adding edges to the graph
        if (works <= 1) {
          if (works === 0 && i < Places / 4) {
            // Adding a road edge
            edges.push({
              type: 0,
              from: num1,
              to: num2,
              color: "orange",
              label: String(Math.floor(Math.random() * 70) + 31),
            });
          }
          i++;
        }
      }
    }
    // Setting the new values of global variables
    src = 1;
    dst = Places;
    curr_data = {
      nodes: nodes,
      edges: edges,
    };
  }
  genNew.onclick = function () {
    createData();
    network.setData(curr_data);
    temptext2.innerText =
      "Find shortest path from " + cities[src - 1] + " to " + cities[dst - 1];
    temptext.style.display = "inline";
    temptext2.style.display = "inline";
    container2.style.display = "none";
  };

  solve.onclick = function () {
    // Create graph from data and set to display
    temptext.style.display = "none";
    temptext2.style.display = "none";
    container2.style.display = "inline";
    network2.setData(solveData());
  };
  function djikstra(graph, sz, src) {
    let vis = Array(sz).fill(0);
    let dist = [];
    for (let i = 1; i <= sz; i++) dist.push([10000, -1]);
    // dist.push([10000, -1]) setting lower upper bound of distance
    dist[src][0] = 0;
    for (let i = 0; i < sz - 1; i++) {
      let mn = -1;
      for (let j = 0; j < sz; j++) {
        if (vis[j] === 0) {
          if (mn === -1 || dist[j][0] < dist[mn][0]) mn = j;
        }
      }
      vis[mn] = 1;
      for (let j in graph[mn]) {
        let edge = graph[mn][j];
        if (vis[edge[0]] === 0 && dist[edge[0]][0] > dist[mn][0] + edge[1]) {
          dist[edge[0]][0] = dist[mn][0] + edge[1];
          dist[edge[0]][1] = mn;
        }
      }
    }
    return dist;
  }
  function createGraph(data) {
    let graph = [];
    for (let i = 1; i <= Places; i++) {
      graph.push([]);
    }
    for (let i = 0; i < data["edges"].length; i++) {
      let edge = data["edges"][i];
      if (edge["type"] === 1) continue;
      graph[edge["to"] - 1].push([edge["from"] - 1, parseInt(edge["label"])]);
      graph[edge["from"] - 1].push([edge["to"] - 1, parseInt(edge["label"])]);
    }
    return graph;
  }
  function shouldTakePlane(edges, dist1, dist2, mn_dist) {
    let plane = 0;
    let p1 = -1,
      p2 = -1;
    for (let pos in edges) {
      let edge = edges[pos];
      if (edge["type"] === 1) {
        let to = edge["to"] - 1;
        let from = edge["from"] - 1;
        let wght = parseInt(edge["label"]);
        if (dist1[to][0] + wght + dist2[from][0] < mn_dist) {
          plane = wght;
          p1 = to;
          p2 = from;
          mn_dist = dist1[to][0] + wght + dist2[from][0];
        }
        if (dist2[to][0] + wght + dist1[from][0] < mn_dist) {
          plane = wght;
          p2 = to;
          p1 = from;
          mn_dist = dist2[to][0] + wght + dist1[from][0];
        }
      }
    }
    return { plane, p1, p2 };
  }
  function solveData() {
    const data = curr_data;
    // Creating adjacency list matrix graph from question data
    const graph = createGraph(data);
    // Applying djikstra from src and dst
    let dist1 = djikstra(graph, Places, src - 1);
    let dist2 = djikstra(graph, Places, dst - 1);
    // Initialise min_dist to min distance via bus from src to dst
    let mn_dist = dist1[dst - 1][0];
    // See if plane should be used
    let { plane, p1, p2 } = shouldTakePlane(
      data["edges"],
      dist1,
      dist2,
      mn_dist
    );
    let new_edges = [];
    if (plane !== 0) {
      new_edges.push({
        arrows: { to: { enabled: true } },
        from: p1 + 1,
        to: p2 + 1,
        color: "green",
        label: String(plane),
      });
      // Using spread operator to push elements of result of pushEdges to new_edges
      new_edges.push(...pushEdges(dist1, p1, false));
      new_edges.push(...pushEdges(dist2, p2, true));
    } else {
      new_edges.push(...pushEdges(dist1, dst - 1, false));
    }
    const ans_data = {
      nodes: data["nodes"],
      edges: new_edges,
    };
    return ans_data;
  }
  function pushEdges(dist, curr, reverse) {
    let tmp_edges = [];
    while (dist[curr][0] !== 0) {
      let fm = dist[curr][1];
      if (reverse)
        tmp_edges.push({
          arrows: { to: { enabled: true } },
          from: curr + 1,
          to: fm + 1,
          color: "orange",
          label: String(dist[curr][0] - dist[fm][0]),
        });
      else
        tmp_edges.push({
          arrows: { to: { enabled: true } },
          from: fm + 1,
          to: curr + 1,
          color: "orange",
          label: String(dist[curr][0] - dist[fm][0]),
        });
      curr = fm;
    }
    return tmp_edges;
  }
  genNew.click();
};
