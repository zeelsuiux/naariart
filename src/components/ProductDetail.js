import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiPhone, FiStar, FiShield } from 'react-icons/fi';
import PublicLayout from './PublicLayout';
import { productAPI } from '../services/api';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    productAPI
      .getProductById(productId)
      .then((data) => {
        setProduct(data);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [productId]);

  const image =
    product?.outfitStyleRefImg?.[0] || product?.image || product?.images?.[0];

  return (
    <PublicLayout>
      <section className="product-detail-page">
        <div className="product-breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/product" className="breadcrumb-link">Collection</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-curr">{product?.name || 'Design Details'}</span>
        </div>

        {state === 'loading' && (
          <div className="catalog-loading">
            <div className="catalog-spinner" />
            <p>Loading piece details...</p>
          </div>
        )}

        {state === 'error' && (
          <div className="catalog-error">
            <h3>Design Not Found</h3>
            <p>We could not find the design you are looking for.</p>
            <Link className="public-button primary" to="/product">← Return to Collection</Link>
          </div>
        )}

        {state === 'ready' && product && (
          <div className="product-detail-grid">
            {/* Visual Column */}
            <div className="detail-visual-col">
              <div className="detail-image-wrap">
                {image ? (
                  <img src={image} alt={product.name || 'Naari Art piece'} />
                ) : (
                  <div className="detail-image-fallback">
                    <span className="brand-fallback">Naari Art</span>
                    <small>Artisanal Haute Couture</small>
                  </div>
                )}
                <span className="detail-badge">Bespoke Atelier Piece</span>
              </div>
            </div>

            {/* Content Column */}
            <div className="product-detail-copy">
              <span className="detail-category-tag">
                {product.subCategoryName || product.outfitTypeName || 'Exclusive Couture'}
              </span>

              <h1 className="detail-title">
                {product.name || product.outfitTypeName || 'Custom Ensembled Silhouette'}
              </h1>

              <div className="detail-price-box">
                <span className="price-tag">Made-to-Order</span>
                <span className="price-sub">Custom tailored to your exact measurements</span>
              </div>

              <div className="detail-desc">
                <p>
                  {product.description ||
                    'An intricately considered silhouette crafted from premium handpicked textiles, featuring hand-embroidered accents and custom fit tailored for unforgettable celebrations.'}
                </p>
              </div>

              {/* Atelier Highlights */}
              <div className="detail-highlights">
                <div className="detail-hl-item">
                  <FiCheckCircle className="hl-icon" />
                  <div>
                    <strong>Custom Made to Your Measurements</strong>
                    <p>Fitted precisely with your individual posture and size requirements.</p>
                  </div>
                </div>
                <div className="detail-hl-item">
                  <FiStar className="hl-icon" />
                  <div>
                    <strong>Handcrafted Artistry</strong>
                    <p>Zardozi, Resham, cutwork and hand embellishments by master karigars.</p>
                  </div>
                </div>
                <div className="detail-hl-item">
                  <FiShield className="hl-icon" />
                  <div>
                    <strong>Fabric Customization Available</strong>
                    <p>Personalize color palette, dupatta length, necklines, and borders.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="detail-actions">
                <Link
                  className="public-button primary"
                  to={`/contact?piece=${encodeURIComponent(product.name || product.outfitTypeName || 'Custom Piece')}`}
                >
                  Enquire About This Piece <FiArrowRight />
                </Link>
                <a
                  className="public-button secondary"
                  href={`https://wa.me/919825000000?text=${encodeURIComponent(`Hello Naari Art, I am interested in inquiring about ${product.name || product.outfitTypeName || 'this design'}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiPhone /> WhatsApp Inquiry
                </a>
              </div>

              <div className="detail-meta-footer">
                <p><strong>Studio Location:</strong> Surat, Gujarat • In-person trials and worldwide shipping available.</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  );
};

export default ProductDetail;
