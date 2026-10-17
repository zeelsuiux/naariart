import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiStar, FiEye } from 'react-icons/fi';
import PublicLayout from './PublicLayout';
import { productAPI } from '../services/api';

const getImage = (product) =>
  product?.outfitStyleRefImg?.[0] || product?.image || product?.images?.[0];

const PublicProduct = () => {
  const [products, setProducts] = useState([]);
  const [state, setState] = useState('loading');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    productAPI
      .getProducts()
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const cat = p.outfitTypeName || p.category || p.subCategoryName;
      if (cat) set.add(cat);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const name = String(item.name || item.outfitTypeName || '').toLowerCase();
      const cat = String(item.outfitTypeName || item.subCategoryName || '').toLowerCase();
      const matchesSearch = !search || name.includes(search.toLowerCase()) || cat.includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === 'All' ||
        item.outfitTypeName === activeCategory ||
        item.subCategoryName === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  return (
    <PublicLayout>
      <section className="public-catalog-page">
        {/* Catalog Hero */}
        <div className="catalog-hero">
          <div className="hero-badge">
            <FiStar /> Curated Haute Couture
          </div>
          <h1 className="catalog-title">Pieces to be remembered in.</h1>
          <p className="public-lede">
            Each creation is an expression of artisanal devotion, tailored to order in our Surat atelier.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="catalog-toolbar">
          <div className="category-pills">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="catalog-search">
            <FiSearch className="search-icon" />
            <input
              type="search"
              placeholder="Search silhouettes, outfits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Products Grid */}
        {state === 'loading' && (
          <div className="catalog-loading">
            <div className="catalog-spinner" />
            <p>Loading the Naari Art collection...</p>
          </div>
        )}

        {state === 'error' && (
          <div className="catalog-error">
            <h3>Unable to load collection</h3>
            <p>Please check back shortly or contact our atelier directly.</p>
            <Link className="public-button primary" to="/contact">Contact Atelier</Link>
          </div>
        )}

        {state === 'ready' && filteredProducts.length === 0 && (
          <div className="catalog-empty">
            <h3>No designs matching your search</h3>
            <p>Looking for a specific custom ensemble? We can custom craft it for you.</p>
            <Link className="public-button primary" to="/contact">Request Custom Design</Link>
          </div>
        )}

        {state === 'ready' && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const imgUrl = getImage(product);
              return (
                <div className="public-product-card" key={product._id}>
                  <Link to={`/product/${product._id}`} className="product-image-wrap">
                    {imgUrl ? (
                      <img src={imgUrl} alt={product.name || 'Naari Art product'} loading="lazy" />
                    ) : (
                      <div className="product-image-fallback">
                        <span className="brand-fallback">Naari Art</span>
                        <small>Bespoke Piece</small>
                      </div>
                    )}
                    <span className="product-card-badge">Made to Measure</span>
                    <div className="product-card-hover-action">
                      <span><FiEye /> View Details</span>
                    </div>
                  </Link>

                  <div className="product-card-copy">
                    <span className="product-meta-cat">
                      {product.subCategoryName || product.outfitTypeName || 'Couture'}
                    </span>
                    <h3 className="product-title">
                      <Link to={`/product/${product._id}`}>
                        {product.name || product.outfitTypeName || 'Bespoke Ensembled Piece'}
                      </Link>
                    </h3>
                    <div className="product-card-bottom">
                      <Link className="product-enquire-link" to={`/product/${product._id}`}>
                        View Details & Enquire <FiArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
};

export default PublicProduct;
