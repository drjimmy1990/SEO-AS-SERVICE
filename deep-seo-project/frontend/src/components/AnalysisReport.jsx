import React, { useState, useEffect } from 'react';
import { getAiSuggestions, saveLiveSettings } from '../services/api';

// This is our main display component now. It shows the status AND the form field.
const EditableReportItem = ({ status, title, children }) => {
    const statusColors = { good: '#28a745', warn: '#ffc107', bad: '#dc3545' };
    const statusIcons = { good: '✓', warn: '!', bad: '✗' };

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '5px', marginBottom: '1.5rem', padding: '1rem', background: '#fff' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', color: '#333' }}>
                <span style={{ color: statusColors[status], marginRight: '10px', fontSize: '24px' }}>{statusIcons[status]}</span>
                {title}
            </h3>
            <div style={{ marginLeft: '34px', paddingTop: '5px' }}>
                {children}
            </div>
        </div>
    );
};

// This component is for displaying AI suggestions
const SuggestionBox = ({ children }) => (
    <div style={{ border: '1px dashed #007bff', backgroundColor: '#f0f8ff', borderRadius: '5px', padding: '10px', marginTop: '10px', fontSize: '14px' }}>
        <strong style={{ color: '#0056b3' }}>✨ AI Suggestions:</strong>
        <div style={{ marginTop: '5px' }}>{children}</div>
    </div>
);


const AnalysisReport = ({ report, pageId, onSave }) => {
    const [suggestions, setSuggestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({ title: '', description: '', images: [] });

    useEffect(() => {
        if (report?.report_data) {
            const { title, description } = report.report_data.currentSeo;
            const { images } = report.report_data.contentAnalysis;
            setFormData({
                title: title || '',
                description: description || '',
                images: images.map(img => ({ selector: img.selector, alt: img.alt || '' }))
            });
            setSuggestions(null); // Clear old suggestions when a new report is selected
        }
    }, [report]);

    const handleGetSuggestions = async () => {
        setIsLoading(true);
        try {
            const response = await getAiSuggestions(report.id);
            setSuggestions(response.data);
        } catch (err) {
            alert('Failed to get AI suggestions.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormChange = (e, index) => {
        const { name, value } = e.target;
        if (name === 'image_alt') {
            const newImages = [...formData.images];
            newImages[index].alt = value;
            setFormData(prev => ({ ...prev, images: newImages }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const useSuggestion = (field, value, index) => {
        if (field === 'image_alt') {
            const newImages = [...formData.images];
            newImages[index].alt = value;
            setFormData(prev => ({ ...prev, images: newImages }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveLiveSettings(pageId, formData);
            alert('Settings saved successfully!');
            // Check if onSave is a function before calling it
            if (typeof onSave === 'function') {
                onSave();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!report) return null;
    const { report_data: reportData } = report;
    const { h1_count } = reportData.currentSeo;
    const { headings, images: originalImages } = reportData.contentAnalysis;

    // --- The Diagnostic Logic (The "Score") ---
    const titleStatus = formData.title.length >= 10 && formData.title.length <= 60 ? 'good' : 'warn';
    const descStatus = formData.description.length >= 50 && formData.description.length <= 160 ? 'good' : 'warn';
    const h1Status = h1_count === 1 ? 'good' : 'bad';
    const altTextStatus = formData.images.every(img => img.alt && img.alt.length > 5) ? 'good' : 'warn';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Editing Live Settings for: <a href={reportData.url} target="_blank">{reportData.url}</a></h2>
                <div>
                    <button onClick={handleGetSuggestions} disabled={isLoading || isSaving} style={{ padding: '8px 12px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
                        {isLoading ? '🤖 Thinking...' : '✨ Get AI Suggestions'}
                    </button>
                    <button onClick={handleSave} disabled={isSaving} style={{ marginLeft: '10px', padding: '8px 12px', cursor: 'pointer', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
                        {isSaving ? 'Saving...' : 'Save & Publish'}
                    </button>
                </div>
            </div>

            <EditableReportItem status={titleStatus} title="Title Tag">
                <p>Length: {formData.title.length} (Recommended: 10-60)</p>
                <textarea name="title" value={formData.title} onChange={handleFormChange} style={{ width: '95%', minHeight: '40px', marginTop: '5px' }} />
                {suggestions?.title_suggestions && (
                    <SuggestionBox>
                        <ul>{suggestions.title_suggestions.map((s, i) => <li key={i} style={{ marginBottom: '5px' }}>{s} <button onClick={() => useSuggestion('title', s)}>Use</button></li>)}</ul>
                    </SuggestionBox>
                )}
            </EditableReportItem>

            <EditableReportItem status={descStatus} title="Meta Description">
                <p>Length: {formData.description.length} (Recommended: 50-160)</p>
                <textarea name="description" value={formData.description} onChange={handleFormChange} style={{ width: '95%', minHeight: '80px', marginTop: '5px' }} />
                {suggestions?.description_suggestions && (
                    <SuggestionBox>
                        <ul>{suggestions.description_suggestions.map((s, i) => <li key={i} style={{ marginBottom: '5px' }}>{s} <button onClick={() => useSuggestion('description', s)}>Use</button></li>)}</ul>
                    </SuggestionBox>
                )}
            </EditableReportItem>

            <EditableReportItem status={h1Status} title="H1 Heading">
                <p>Found {h1_count} &lt;h1&gt; tag(s). (Recommended: 1)</p>
                {headings.filter(h => h.tag === 'h1').map((h, i) => <p key={i}>- Current H1: "{h.text}"</p>)}
                {suggestions?.h1_recommendations && (
                    <SuggestionBox>
                        <p>{suggestions.h1_recommendations}</p>
                    </SuggestionBox>
                )}
            </EditableReportItem>

            <EditableReportItem status={altTextStatus} title="Image Alt Texts">
                <ul>
                    {formData.images.map((img, index) => {
                        const originalImgData = originalImages.find(i => i.selector === img.selector);
                        // Safe access to src with fallback
                        const imgSrc = originalImgData ? originalImgData.src : '';

                        const recommendation = suggestions?.image_alt_recommendations?.find(rec => rec.selector === img.selector);
                        return (
                            <li key={img.selector} style={{ marginBottom: '15px', listStyle: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={imgSrc} alt="thumbnail" width="50" height="50" style={{ marginRight: '10px', border: '1px solid #ccc', objectFit: 'cover' }} />
                                    <input placeholder="Enter alt text..." name="image_alt" value={img.alt} onChange={(e) => handleFormChange(e, index)} style={{ width: '70%', padding: '8px' }} />
                                </div>
                                {recommendation && (
                                    <SuggestionBox>
                                        <p>"{recommendation.suggested_alt}" <button onClick={() => useSuggestion('image_alt', recommendation.suggested_alt, index)}>Use</button></p>
                                    </SuggestionBox>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </EditableReportItem>
        </div>
    );
};

export default AnalysisReport;
