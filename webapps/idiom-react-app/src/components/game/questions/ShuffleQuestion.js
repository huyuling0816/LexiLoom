import {DndContext, useDraggable, useDroppable} from '@dnd-kit/core';
import {useEffect, useState} from 'react';

const ShuffleQuestion = ({question, idiom, onAnswer, timeLeft}) => {
    const size = 80;
    const [body, setBody] = useState(null);
    const [slots, setSlots] = useState([]);
    const [remaining, setRemaining] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        console.log(question)
        const chars = idiom.split('');
        const charObjs = chars.map((char, index) => ({id: `${char}-${index}`, char}));
        const shuffled = [...charObjs].sort(() => Math.random() - 0.5);

        setSlots([null, null, null, null]);
        setRemaining(shuffled);
        setIsFinished(false);
        setIsCorrect(false);

        const match = question.match(/\((.*?)\)/);
        setBody(match ? match[1] : null);
    }, [idiom, question]);

    const handleDragEnd = (event) => {
        const {active, over} = event;
        if (!over) return;

        const char = active.data.current;
        const slotIndex = parseInt(over.id.split('-')[1]);

        if (slots[slotIndex]) return;

        const newSlots = [...slots];
        newSlots[slotIndex] = char;
        setSlots(newSlots);
        setRemaining((prev) => prev.filter((c) => c.id !== char.id));

        if (newSlots.every(Boolean)) {
            const idiomString = newSlots.map(c => c.char).join('');
            setIsFinished(true);
            if (idiomString === idiom) {
                setIsCorrect(true);
                onAnswer(true);
            } else {
                onAnswer(false);
            }
        }
    };

    const handleUndo = (index) => {
        if (isFinished) return;
        const charToRemove = slots[index];
        if (!charToRemove) return;
        const newSlots = [...slots];
        newSlots[index] = null;
        setSlots(newSlots);
        setRemaining((prev) => [...prev, charToRemove]);
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="p-4">
                <p className="mt-4 text-center fs-5 question mt-4 mb-4 fw-bold">
                    Drag and drop the characters to form the correct idiom: <br/>
                    {body}
                </p>

                <div className="d-flex justify-content-center align-items-center gap-4">
                    {slots.map((char, i) => (
                        <DropZone key={i} index={i} char={char} onClick={handleUndo}/>
                    ))}
                </div>

                <div className="d-flex justify-content-center align-items-center gap-4 mt-4">
                    {remaining.map((charObj) => (
                        <DraggableCharacter key={charObj.id} charObj={charObj}/>
                    ))}
                </div>
            </div>
        </DndContext>
    );

    function DraggableCharacter({charObj}) {
        const {attributes, listeners, setNodeRef, transform} = useDraggable({
            id: charObj.id,
            data: charObj,
            disabled: isFinished || timeLeft === 0,
        });

        const style = {
            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            height: `${size}px`,
            width: `${size}px`,
            padding: '10px',
            margin: '5px',
            cursor: 'grab',
            display: 'flex',
            backgroundColor: '#CAC9FB',
            fontWeight: 'bold',
            fontSize: '30px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '18px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        };

        return (
            <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
                {charObj.char}
            </div>
        );
    }

    function DropZone({index, char, onClick}) {
        const {isOver, setNodeRef} = useDroppable({id: `slot-${index}`});

        const style = {
            height: `${size}px`,
            width: `${size}px`,
            border: '2px dashed gray',
            margin: '5px',
            backgroundColor: isFinished
                ? isCorrect
                    ? '#6AB191'
                    : '#FF8B8C'
                : isOver
                    ? '#D5E0FB'
                    : '#f9f9f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '30px',
            cursor: char ? 'pointer' : 'default',
            borderRadius: '18px',
            locked: isFinished || timeLeft === 0,
        };

        return (
            <div ref={setNodeRef} style={style} onClick={() => char && onClick(index)}>
                {char ? char.char : ''}
            </div>
        );
    }
};

export default ShuffleQuestion;