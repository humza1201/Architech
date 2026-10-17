import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { generate3DView } from "../../lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import Button from "../../components/ui/Button";

const VisualizerId = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const { initialImage,initialRender, name } = location.state || {};
    const hasInitialGenerated = useRef(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(initialRender || null);

    const handleBack = () => {
        navigate('/');
    }

    const runGeneration = async () => {
        if (initialImage) {
            try{
                setIsProcessing(true);
                const result = await generate3DView({ sourceImage: initialImage });

                if (result.renderedImage) {
                    setCurrentImage(result.renderedImage);
                    // update the project with the rendered image
                }
            }catch (error) {
                console.error('Error generating 3D view:', error);
            }finally{
                setIsProcessing(false);
            }
        }
    }

    useEffect(() => {
        if ( !initialImage || hasInitialGenerated.current) {
            return
        }

        if(initialRender){
            setCurrentImage(initialRender)
            hasInitialGenerated.current = true
            return
        }

        hasInitialGenerated.current = true
        runGeneration();

    }, [initialImage, initialRender]);
    return (
            <div className="visualizer">
                <nav className="topbar">
                    <div className="brand">
                        <Box className="logo" size={20} />

                        <span className="name">Architect</span>
                    </div>

                    <Button variant="ghost" onClick={handleBack} className="exit">
                        <X className="icon" /> Exit Editor
                    </Button>
                </nav>

                <section className="content">
                    <div className="panel">
                        <div className="panel-header">
                            <div className="panel-data">
                                <p>project</p>
                                <h2>{'Untitled Project'}</h2>
                                <p className="note">Created by you</p>
                            </div>

                            <div className="panel-actions">
                                <Button onClick={()=>{}} size="sm" className="export" disabled={!currentImage || isProcessing}>
                                    <Download className="w-4 h-4 mr-2" />Export
                                </Button>

                                <Button onClick={()=>{}} size="sm" className="share">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>

                        <div className={`render-area ${isProcessing? 'is-processing':''}`}>
                            {
                                currentImage ? (
                                    <img src={currentImage} className="render-img" alt="AI Render" />
                                ) : (
                                    <div className="render-placeholder">
                                        {initialImage && (
                                            <img src={initialImage} className="render-fallback" alt="Original" />
                                        )}
                                    </div>
                                )
                            }

                            {isProcessing && (
                                <div className="render-overlay">
                                    <div className="rendering-card">
                                        <RefreshCcw className="spinner" />
                                        <span className="title">Rendering...</span>
                                        <span className="subtitle">Generating your 3D visualization...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>


                {/* {initialImage && (
                    <div className="image-container">
                        <h1>Source Image</h1>
                        <img src={initialImage} alt="source" />
                    </div>

                )} */}
            </div>
    )
}

export default VisualizerId