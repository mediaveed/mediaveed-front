import React from 'react';

// Top Banner Ad Component (728x90)
export const TopBannerAd = () => {
    return (
        <div style={{
            width: '100%',
            maxWidth: '728px',
            height: '90px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Decorative elements */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '20%',
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
            }} />

            {/* Content */}
            <div style={{ zIndex: 1 }}>
                <div style={{
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: '0.25rem',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}>
                    🚀 Premium Video Tools
                </div>
                <div style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                }}>
                    Edit, Convert & Download - All in One Place
                </div>
            </div>

            <button style={{
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#667eea',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                zIndex: 1,
                textShadow: 'none',
            }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
                    e.target.style.background = 'rgba(255, 255, 255, 1)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                }}>
                Try Now →
            </button>
        </div>
    );
};

// Mid Banner Ad Component (300x250)
export const MidBannerAd = () => {
    return (
        <div style={{
            width: '100%',
            maxWidth: '300px',
            height: '250px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
        }}>
            {/* Background pattern */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
                pointerEvents: 'none',
            }} />

            {/* Icon */}
            <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '2.5rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            }}>
                🎬
            </div>

            {/* Content */}
            <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '800',
                color: 'white',
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}>
                Video Pro Suite
            </h3>
            <p style={{
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.95)',
                marginBottom: '1rem',
                fontWeight: '500',
                lineHeight: '1.4',
            }}>
                Professional video editing tools for creators
            </p>

            <button style={{
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#f5576c',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '50px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                textShadow: 'none',
            }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
                    e.target.style.background = 'rgba(255, 255, 255, 1)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                }}>
                Learn More
            </button>

            {/* Badge */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '0.3rem 0.7rem',
                borderRadius: '20px',
                fontSize: '0.7rem',
                fontWeight: '700',
                color: 'white',
                textTransform: 'uppercase',
            }}>
                Ad
            </div>
        </div>
    );
};

// Middle Page Banner Ad (728x90) - Shows in content area
export const MiddleBannerAd = () => {
    return (
        <div style={{
            width: '100%',
            maxWidth: '728px',
            height: '90px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Decorative elements */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '20%',
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
            }} />

            {/* Content */}
            <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    fontSize: '2rem',
                }}>
                    ⚡
                </div>
                <div>
                    <div style={{
                        fontSize: '1.3rem',
                        fontWeight: '800',
                        color: 'white',
                        marginBottom: '0.25rem',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}>
                        Download Faster & Easier
                    </div>
                    <div style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: '500',
                    }}>
                        Experience lightning-fast downloads
                    </div>
                </div>
            </div>

            <button style={{
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#43e97b',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                zIndex: 1,
                textShadow: 'none',
            }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
                    e.target.style.background = 'rgba(255, 255, 255, 1)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                }}>
                Try Now →
            </button>
        </div>
    );
};

// Footer Banner Ad Component (970x250) - Responsive
export const FooterBannerAd = () => {
    return (
        <div style={{
            width: '100%',
            maxWidth: '970px',
            height: '250px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2rem 3rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background decorative elements */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '10%',
                width: '200px',
                height: '200px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-80px',
                left: '30%',
                width: '250px',
                height: '250px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
            }} />

            {/* Left side - Content */}
            <div style={{ zIndex: 1, maxWidth: '500px' }}>
                <div style={{
                    display: 'inline-block',
                    background: 'rgba(255, 255, 255, 0.3)',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    ⚡ Limited Offer
                </div>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '900',
                    color: 'white',
                    marginBottom: '0.75rem',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    lineHeight: '1.2',
                }}>
                    Upgrade Your Media Experience
                </h2>
                <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.95)',
                    marginBottom: '1.5rem',
                    fontWeight: '500',
                }}>
                    Access premium features, unlimited downloads, and ad-free experience
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        color: '#4facfe ',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '50px',
                        fontWeight: '800',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s ease',
                        textShadow: 'none',
                    }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.4)';
                            e.target.style.background = 'rgba(255, 255, 255, 1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                        }}>
                        Get Started
                    </button>
                    <button style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        padding: '1rem 2rem',
                        borderRadius: '50px',
                        fontWeight: '800',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.borderColor = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                        }}>
                        Learn More
                    </button>
                </div>
            </div>

            {/* Right side - Visual element */}
            <div style={{
                zIndex: 1,
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
            }}>
                <div style={{
                    width: '120px',
                    height: '180px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                }}>
                    📱
                </div>
                <div style={{
                    width: '120px',
                    height: '180px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                }}>
                    💻
                </div>
            </div>
        </div>
    );
};

// Responsive wrapper component
export const ResponsiveAdWrapper = ({ children, type }) => {
    const mobileStyles = {
        top: { maxWidth: '100%', height: 'auto', minHeight: '90px' },
        mid: { maxWidth: '100%', height: 'auto', minHeight: '200px' },
        footer: { maxWidth: '100%', height: 'auto', minHeight: '180px', padding: '1.5rem' },
    };

    return (
        <div style={{
            width: '100%',
            padding: '1rem 0',
        }}>
            <style>
                {`
          @media (max-width: 768px) {
            .ad-container-${type} > div {
              height: auto !important;
              min-height: ${mobileStyles[type].minHeight} !important;
              padding: ${mobileStyles[type].padding || '1rem'} !important;
            }
            .ad-container-${type} .desktop-only {
              display: none !important;
            }
            .ad-container-${type} h2 {
              font-size: 1.3rem !important;
            }
            .ad-container-${type} p {
              font-size: 0.85rem !important;
            }
          }
        `}
            </style>
            <div className={`ad-container-${type}`}>
                {children}
            </div>
        </div>
    );
};