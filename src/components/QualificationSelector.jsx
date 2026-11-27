import React, { useState } from "react";

export default function QualificationSelector({ treeNodes, selectedQualifications, onChange }) {
  const [currentPath, setCurrentPath] = useState([null]);

  const handleLevelChange = (levelIndex, selectedNodeId) => {
    let options = [];
    if (levelIndex === 0) {
      options = treeNodes || [];
    } else {
      options = currentPath[levelIndex - 1]?.children || [];
    }
    
    const selectedNode = options.find(opt => opt._id === selectedNodeId);

    setCurrentPath((prev) => {
      const newPath = [...prev];
      newPath.splice(levelIndex + 1);
      newPath[levelIndex] = selectedNode;
      if (selectedNode && selectedNode.children && selectedNode.children.length > 0) {
        newPath.push(null);
      }
      return newPath;
    });
  };

  const addQualification = () => {
    if (currentPath.length === 0 || !currentPath[0]) return;

    let qStr = currentPath[0].name || "";
    if (currentPath.length > 1 && currentPath[1]) {
      qStr += " | " + currentPath[1].name;
    }
    if (currentPath.length > 2 && currentPath[2]) {
      qStr += " - " + currentPath[2].name;
    }

    if (!selectedQualifications.includes(qStr)) {
      onChange([...selectedQualifications, qStr]);
    }
    setCurrentPath([null]);
  };

  const removeQualification = (q) => {
    onChange(selectedQualifications.filter((item) => item !== q));
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {selectedQualifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedQualifications.map((q) => (
            <div key={q} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-semibold">
              <span>{q}</span>
              <button 
                type="button" 
                onClick={() => removeQualification(q)}
                className="text-indigo-400 hover:text-indigo-800 focus:outline-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentPath.map((node, index) => {
          let options = [];
          if (index === 0) {
            options = treeNodes || [];
          } else {
            options = currentPath[index - 1]?.children || [];
          }

          const label = index === 0 ? "Select Basic Degree" : index === 1 ? "Select Post Graduation" : "Select Specialization";

          return (
            <div key={index} className="flex flex-col">
              <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
              <select
                disabled={options.length === 0}
                value={node ? node._id : ""}
                onChange={(e) => handleLevelChange(index, e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 disabled:bg-gray-100 text-sm"
              >
                <option value="" disabled>
                  {options.length === 0 ? "No options" : "Select..."}
                </option>
                {options.map((opt) => (
                  <option key={opt._id} value={opt._id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {currentPath.length > 0 && currentPath[0] && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addQualification}
            className="text-indigo-600 font-bold hover:text-indigo-800 text-sm flex items-center gap-1 transition-colors"
          >
            + Add Qualification
          </button>
        </div>
      )}
    </div>
  );
}
