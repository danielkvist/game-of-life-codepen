import React, { useState, useRef, useCallback } from 'react';
import { render } from 'react-dom';
import produce from 'immer';

const neighborsPos = [
	[0, 1],
	[0, -1],
	[1, -1],
	[-1, 1],
	[1, 1],
	[-1, -1],
	[1, 0],
	[-1, 0],
];

const generateGrid = (numberCols, numberRows, random = false) => {
	const rows = [];
	for (let i = 0; i < numberRows; i++) {
		rows.push(
			Array.from(Array(numberCols), () =>
				random ? (Math.random() > 0.65 ? 1 : 0) : 0
			)
		);
	}

	return rows;
};

const App = () => {
	const [numberRows, setNumberRows] = useState(20);
	const [numberCols, setNumberCols] = useState(20);
	const [grid, setGrid] = useState(() => generateGrid(numberCols, numberRows));
	const [running, setRunning] = useState(false);
	const runningRef = useRef(running);
	runningRef.current = running;

	const runSimulation = useCallback(() => {
		if (!runningRef.current) return;

		setGrid((g) => {
			return produce(g, (gridCopy) => {
				for (let i = 0; i < numberRows; i++) {
					for (let j = 0; j < numberCols; j++) {
						let neighbors = 0;
						neighborsPos.forEach(([x, y]) => {
							const newI = i + x;
							const newJ = j + y;

							if (
								newI >= 0 &&
								newI < numberRows &&
								newJ >= 0 &&
								newJ < numberCols
							) {
								neighbors += g[newI][newJ];
							}
						});

						if (neighbors < 2 || neighbors > 3) {
							gridCopy[i][j] = 0;
						} else if (g[i][j] === 0 && neighbors === 3) {
							gridCopy[i][j] = 1;
						}
					}
				}
			});
		});

		// simulate
		setTimeout(runSimulation, 100);
	}, [numberCols, numberRows]);

	return (
		<div className="w-screen h-screen flex flex-col items-center justify-center gap-3">
			<div className="flex gap-5">
				<button
					type="button"
					className="py-1 px-5 bg-gray-800 text-white lowercase rounded"
					onClick={() => {
						setRunning(!running);
						runningRef.current = !running;
						runSimulation();
					}}
				>
					{running ? 'stop' : 'start'}
				</button>
				<button
					type="button"
					className="py-1 px-5 bg-gray-800 text-white lowercase rounded"
					onClick={() => {
						setRunning(false);
						runningRef.current = false;
						setGrid(() => generateGrid(numberCols, numberRows, true));
					}}
				>
					random
				</button>
				<button
					type="button"
					className="py-1 px-5 bg-gray-800 text-white lowercase rounded"
					onClick={() => {
						setRunning(false);
						runningRef.current = false;
						setGrid(() => generateGrid(numberCols, numberRows));
					}}
				>
					clear
				</button>
			</div>

			<div
				className="grid"
				style={{
					gridTemplateColumns: `repeat(${numberCols}, 20px)`,
					gridTemplateRows: `repeat(${numberCols}, 20px)`,
				}}
			>
				{grid.map((rows, i) =>
					rows.map((_, j) => (
						<div
							key={`${i}-${j}`}
							className={`w-full h-full border ${
								!grid[i][j] ? undefined : 'bg-gray-800'
							}`}
							onClick={() => {
								if (running) return;

								const newGrid = produce(grid, (gridCopy) => {
									gridCopy[i][j] = grid[i][j] ? 0 : 1;
								});
								setGrid(newGrid);
							}}
						></div>
					))
				)}
			</div>
		</div>
	);
};

const app = document.getElementById('app');
render(<App />, app);
