import { CustomSet } from '~/types/CustomSet';
import { Queue } from '~/types/Queue';
import { Puzzle } from './Puzzle';

export const puzzle25 = new Puzzle({
    day: 25,
    parseInput: (fileData) => fileData,
    part1: (fileData) => {
        const { graph, nodes: components, edges } = buildGraph(fileData);
        const nComponents = graph.size();

        const levelSums = new Map<Component, number>();
        const edgeTraversals = new Map<string, number>();

        for (const firstComponent of components) {
            const levels = new Map<Component, number>();

            const queue = new Queue<Component>();
            queue.add(firstComponent);
            levels.set(firstComponent, 0);
            queue.process((component) => {
                const level = levels.get(component)!;
                component.neighbors.forEach((neighbor) => {
                    if (levels.has(neighbor)) {
                        return;
                    }
                    const edge = new Edge({
                        graph,
                        vertex1: component,
                        vertex2: neighbor,
                    });
                    const edgeTraversal = edgeTraversals.get(edge.id) || 0;
                    edgeTraversals.set(edge.id, edgeTraversal + 1);
                    queue.add(neighbor);
                    levels.set(neighbor, level + 1);
                });
            });

            for (const [component, level] of levels.entries()) {
                const levelSum = levelSums.get(component) || 0;
                levelSums.set(component, levelSum + level);
            }
        }

        const edgePrioritySorted = [...edgeTraversals.entries()]
            .sort(([, a], [, b]) => b - a)
            .map(([edgeId]) => edges.get(edgeId)!);

        for (const edge1 of edgePrioritySorted) {
            for (const edge2 of edgePrioritySorted) {
                if (edge1 === edge2) {
                    continue;
                }
                for (const edge3 of edgePrioritySorted) {
                    if (edge1 === edge3 || edge2 === edge3) {
                        continue;
                    }

                    const { graph: testGraph, nodes } = buildGraph(fileData);

                    testGraph
                        .get(edge1.vertex1.name)
                        ?.breakLink(edge1.vertex2.name);
                    testGraph
                        .get(edge2.vertex1.name)
                        ?.breakLink(edge2.vertex2.name);
                    testGraph
                        .get(edge3.vertex1.name)
                        ?.breakLink(edge3.vertex2.name);

                    const oneComponent = nodes[0]!;
                    const networkSize =
                        oneComponent.getConnectedComponents().size;

                    if (networkSize < nComponents) {
                        return networkSize * (nComponents - networkSize);
                    }
                }
            }
        }
    },
    part2: () => {
        return 'Got all stars!';
    },
});

function buildGraph(fileData: string) {
    const graph = new CustomSet<Component>({
        getKey: (component) => component.name,
    });
    const edges = new CustomSet<Edge, string>({
        getKey: (edge) => edge.toString(),
    });
    fileData
        .split('\n')
        .filter((s) => s)
        .forEach((s) => {
            const [name = '', linkString = ''] = s.split(/:\s+/);
            const links = linkString.split(/\s+/);
            const component =
                graph.get(name) ||
                new Component({
                    name,
                    graph: graph,
                });
            graph.add(component);
            links.forEach((link) => {
                const neighbor =
                    graph.get(link) ||
                    new Component({
                        name: link,
                        graph: graph,
                    });
                component.link(link);
                neighbor.link(name);
                graph.add(neighbor);
                edges.add(
                    new Edge({
                        graph: graph,
                        vertex1: component,
                        vertex2: neighbor,
                    })
                );
            });
        });
    return {
        graph,
        nodes: [...graph.values()],
        edges,
    };
}

class Edge {
    readonly id: string;
    readonly vertex1: Component;
    readonly vertex2: Component;
    readonly graph: CustomSet<Component>;

    constructor({
        graph,
        vertex1,
        vertex2,
    }: {
        vertex1: Component;
        vertex2: Component;
        graph: CustomSet<Component>;
    }) {
        this.vertex1 = vertex1;
        this.vertex2 = vertex2;
        this.graph = graph;
        this.id = [this.vertex1.name, this.vertex2.name].sort().join('-');
    }

    toString() {
        return this.id;
    }
}

class Component {
    readonly name: string;
    readonly links = new Set<string>();
    readonly graph: CustomSet<Component>;

    constructor({
        name,
        graph,
    }: {
        name: string;
        graph: CustomSet<Component>;
    }) {
        this.name = name;
        this.graph = graph;
    }

    link(component: string) {
        this.links.add(component);
    }

    get neighbors() {
        return [...this.links.values()].reduce<Component[]>((links, link) => {
            const neighbor = this.graph.get(link);
            if (neighbor) {
                links.push(neighbor);
            } else {
                console.warn(`No component found for link "${link}"`);
            }
            return links;
        }, []);
    }

    breakLink(component: string) {
        this.links.delete(component);
        const neighbor = this.graph.get(component);
        if (neighbor) {
            neighbor.links.delete(this.name);
        }
    }

    getConnectedComponents() {
        const connectedComponents = new Set<string>();
        const queue = new Queue<string>();
        this.links.forEach((link) => queue.add(link));

        queue.process((componentName) => {
            connectedComponents.add(componentName);

            const component = this.graph.get(componentName);
            if (component) {
                component.links.forEach((link) => {
                    if (!connectedComponents.has(link)) {
                        queue.add(link);
                    }
                });
            }
        });

        return connectedComponents;
    }
}
