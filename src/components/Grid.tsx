import { useDrop } from "react-dnd";
import { useCallback, useEffect, useState } from "react";
import { PageModel } from "../types/Page";
import { EntityBox } from "./EntityBox";
import { Connection } from "../types/Connection";

const Grid = ({ pages, setPages, cursor }: { pages: PageModel[]; setPages: Function, cursor: "default" | "move" }) => {
    const [selectedPages, setSelectedPages] = useState<string[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedConn, setSelectedConn] = useState<Connection | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Backspace') {
                const spLen = selectedPages.length;
                if (spLen > 0) {
                    const toDelete = selectedPages[spLen - 1];
                    setConnections(connections.filter(c => !(c.id1 === toDelete || c.id2 === toDelete)));
                    setPages((prevPages: PageModel[]) =>
                        prevPages.map((page: PageModel) =>
                            page.page_id === toDelete ? { ...page, position: undefined } : page
                        )
                    );
                    setSelectedPages(selectedPages.filter(p => p !== toDelete));
                } else if (selectedConn !== null) {
                    setConnections(connections.filter(c => c !== selectedConn));
                    setSelectedConn(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedPages, connections, pages]);

    useEffect(() => {
        setSelectedConn(null);
        setSelectedPages([]);
    }, [cursor]);

    const [, drop] = useDrop({
        accept: 'ENTITY',
        drop: (item: { id: string }, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            if (!delta) return;

            const movedEntity = pages.find((entity: PageModel) => entity.page_id === item.id);
            if (movedEntity) {
                const updatedPages = pages.map((entity: PageModel) =>
                    entity.page_id === item.id
                        ? {
                            ...entity,
                            position: {
                                x: (entity.position?.x || 0) + delta.x,
                                y: (entity.position?.y || 0) + delta.y,
                            },
                        }
                        : entity
                );
                setPages(updatedPages);
            }
        },
    });

    const setDropRef = useCallback(
        (element: HTMLDivElement | null) => {
            if (element) {
                drop(element);
            }
        },
        [drop]
    );

    function dotClick(id: string) {
        if (selectedPages.includes(id)) {
            setSelectedPages((prev) => prev.filter(i => i !== id));
        } else {
            if (selectedPages.length === 2) {
                setSelectedPages([id]);
            } else {
                setSelectedPages((prev) => [...prev, id]);
            }
        }

        if (selectedPages.length === 1 && !selectedPages.includes(id)) {
            const exists = connections.find(c => c.id1 === selectedPages[0] && c.id2 === selectedPages[1]);
            if (exists === undefined) setConnections((prev) => [...prev, { id1: selectedPages[0], id2: id }]);
        }

        setSelectedConn(null);
    }

    const getClosestSide = (entity1: PageModel, entity2: PageModel) => {
        const rect1 = {
            left: entity1?.position?.x || 0,
            right: entity1?.position?.x || 0 + 200, // Width of the rectangle
            top: entity1?.position?.y || 0,
            bottom: entity1?.position?.y || 0 + 100, // Height of the rectangle
        };
    
        const rect2 = {
            left: entity2?.position?.x || 0,
            right: entity2?.position?.x || 0 + 200,
            top: entity2?.position?.y || 0,
            bottom: entity2?.position?.y || 0 + 100,
        };

        const horizontalAdjacent = (Math.abs(rect1.left - rect2.left) > Math.abs(rect1.top - rect2.top));
        const verticalAdjacent = (Math.abs(rect1.left - rect2.left) < Math.abs(rect1.top - rect2.top));

        let closestSide1: 'top' | 'right' | 'bottom' | 'left';
        let closestSide2: 'top' | 'right' | 'bottom' | 'left';

        if (horizontalAdjacent) {
            if (rect1.right <= rect2.left) {
                closestSide1 = 'right';
                closestSide2 = 'left';
            } else {
                closestSide1 = 'left';
                closestSide2 = 'right';
            }
        } else if (verticalAdjacent) {
            if (rect1.bottom <= rect2.top) {
                closestSide1 = 'bottom';
                closestSide2 = 'top';
            } else {
                closestSide1 = 'top';
                closestSide2 = 'bottom';
            }
        } else {
            const distances = {
                top: Math.abs(rect1.bottom - rect2.top),
                bottom: Math.abs(rect1.top - rect2.bottom),
                left: Math.abs(rect1.right - rect2.left),
                right: Math.abs(rect1.left - rect2.right),
            };

            closestSide1 = Object.keys(distances).reduce((a, b) => distances[a as 'top' | 'right' | 'bottom' | 'left'] < distances[b as 'top' | 'right' | 'bottom' | 'left'] ? a : b) as 'top' | 'right' | 'bottom' | 'left';
            closestSide2 = Object.keys(distances).reduce((a, b) => distances[a as 'top' | 'right' | 'bottom' | 'left'] < distances[b as 'top' | 'right' | 'bottom' | 'left'] ? b : a) as 'top' | 'right' | 'bottom' | 'left';
        }

        return { closestSide1, closestSide2 };
    };
    
    const getOutlinePosition = (rect: PageModel, side: 'top' | 'right' | 'bottom' | 'left') => {
        const rectX = rect?.position?.x || 0;
        const rectY = rect?.position?.y || 0;
        const width = 200;
        const height = 100;
    
        let position = { x: rectX, y: rectY };
    
        switch (side) {
            case 'top':
                position.x += width / 2;
                break;
            case 'right':
                position.x += width;
                position.y += height / 2;
                break;
            case 'bottom':
                position.x += width / 2;
                position.y += height;
                break;
            case 'left':
                position.y += height / 2;
                break;
        }
    
        return position;
    };
    
    function getStepLine(entity1: PageModel, entity2: PageModel) {
        const { closestSide1, closestSide2 } = getClosestSide(entity1, entity2);
    
        const start = getOutlinePosition(entity1, closestSide1 as 'top' | 'right' | 'bottom' | 'left');
        const end = getOutlinePosition(entity2, closestSide2 as 'top' | 'right' | 'bottom' | 'left');
    
        if (closestSide1 === 'top' && closestSide2 === 'bottom') {
            const midX1 = start.x;
            const midY1 = start.y - 50;
        
            const midX2 = end.x + (200 / 2) - 100;
            return `M ${start.x} ${start.y} 
                    L ${midX1} ${midY1} 
                    L ${midX2} ${midY1}
                    L ${midX2} ${end.y}`;
        }
    
        if (closestSide1 === 'bottom' && closestSide2 === 'top') {
            const midX1 = start.x;
            const midY1 = start.y + 50;
        
            const midX2 = end.x + (200 / 2) - 100;
            return `M ${start.x} ${start.y} 
                    L ${midX1} ${midY1} 
                    L ${midX2} ${midY1}
                    L ${midX2} ${end.y}`;
        }
        
        const midX = (start.x + end.x) / 2;
        return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    }

    function handleSelectConn(conn: Connection) {
        setSelectedConn(conn);
        setSelectedPages([]);
    }

    return (
        <div ref={setDropRef} className="absolute h-screen w-full overflow-auto">
            <svg className="inset-0 w-full h-screen">
                <defs>
                    <marker
                    id="arrowhead-black"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5" 
                    orient="auto"
                    >
                        <polygon points="0 0, 10 3.5, 0 7" fill="black" />
                    </marker>
                    <marker
                    id="arrowhead-black"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5" 
                    orient="auto"
                    >
                        <polygon points="0 0, 10 3.5, 0 7" fill="red" />
                    </marker>
                </defs>
                { connections.map((connection, index) => {
                    const circle1 = pages.find(p => p.page_id === connection.id1);
                    const circle2 = pages.find(p => p.page_id === connection.id2);
                    if (circle1 && circle2) {
                        const path = getStepLine(circle1, circle2);
                        const isSelected = selectedConn === connection;
                        return (
                            <path
                            key={`path-${index}`}
                            d={path}
                            stroke={isSelected ? 'red' : 'black'}
                            strokeWidth="2"
                            fill="none"
                            onClick={() => handleSelectConn(connection)}
                            markerEnd={`url(#arrowhead-${isSelected ? 'red' : 'black'})`}
                            />
                        );
                    }
                    return null;
                }) }
            </svg>
            { pages.filter(p => p.position !== undefined).map((page: PageModel) => (
                <EntityBox
                key={page.page_id}
                page={page}
                onClick={() => dotClick(page.page_id)}
                selected={selectedPages.includes(page.page_id)}
                cursor={cursor}
                />
            )) }
        </div>
    );
};

export default Grid;