import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { productAPI } from '../services/api';
import Pagination from './Pagination.js';
import {
  FiPlus, FiSearch, FiEdit2, FiEye, FiPackage,
  FiGrid, FiList, FiTrash2, FiTag
} from 'react-icons/fi';

const Product = ({ onLogout }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const fetchProducts = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getProducts(search);
      setProducts(Array.isArray(response) ? response : (response || []));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err?.response?.data?.Message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = storage.isAdmin();
  const permissions = storage.getPermissions() || [];
  const productPermission = permissions.find(
    (item) => item?.collectionName === "products" || item?.collectionName === "product"
  );
  const canAddEdit = isAdmin || Boolean(productPermission?.insertUpdate);
  const canView = isAdmin || Boolean(productPermission?.view);
  const canDelete = isAdmin || Boolean(productPermission?.delete);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const sortedProducts = useMemo(() => {
    const sortableItems = [...products];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let valueA = a[sortConfig.key] || '';
        let valueB = b[sortConfig.key] || '';
        valueA = valueA.toString().toLowerCase();
        valueB = valueB.toString().toLowerCase();

        if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [products, sortConfig]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    fetchProducts(value);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.deleteProduct(productId);
      fetchProducts(searchQuery);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err?.response?.data?.Message || 'Failed to delete product');
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  return (
    <div className="mm-app-shell">
      <Sidebar onLogout={handleLogout} activePage="products" />

      <main className="mm-main">
        {/* Sticky Modern Topbar */}
        <header className="mm-topbar">
          <div className="mm-topbar-left">
            <div className="mm-breadcrumbs">
              <span className="mm-bc-root">Naari Art</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-cur">Products</span>
            </div>
          </div>
          <div className="mm-topbar-right">
            <div className="mm-studio-badge">
              <span className="mm-studio-dot" />
              <span>Naari Couture Studio</span>
            </div>
            {canAddEdit && (
              <button
                type="button"
                className="mm-btn-primary"
                onClick={() => navigate('/products/add')}
                id="btn-add-product"
              >
                <FiPlus size={16} /> + Add Product
              </button>
            )}
          </div>
        </header>

        <div className="mm-content">
          {error && (
            <div className="error-banner" style={{ marginBottom: '20px' }}>
              {error}
              <button onClick={() => setError('')} className="close-error">×</button>
            </div>
          )}

          {/* Modern Card / Panel */}
          <div className="mm-table-card">
            {/* My Metaji Module Header */}
            <div className="mm-module-header">
              <div className="mm-header-left">
                <div className="mm-header-icon-badge">
                  <FiPackage size={20} />
                </div>
                <div className="mm-header-title-group">
                  <div className="mm-header-title-row">
                    <h2>Product Catalog</h2>
                    <span className="mm-count-pill">{products.length} Items</span>
                  </div>
                  <p className="mm-header-subtitle">
                    Manage couture designs, fabrics, outfits and collections
                  </p>
                </div>
              </div>

              <div className="mm-header-right">
                {/* View Switcher */}
                <div className="mm-view-toggle">
                  <button
                    className={viewMode === 'table' ? 'active' : ''}
                    onClick={() => setViewMode('table')}
                    title="Table View"
                  >
                    <FiList size={13} /> Table
                  </button>
                  <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <FiGrid size={13} /> Grid
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mm-search-bar">
                  <FiSearch className="search-icon" size={14} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="mm-table-state">
                <div className="state-desc">Loading products catalog...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="mm-table-state">
                <div className="state-title">No products found</div>
                <div className="state-desc">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Start building your couture catalog today.'}
                </div>
                {canAddEdit && (
                  <button
                    className="mm-btn-primary"
                    onClick={() => navigate('/products/add')}
                  >
                    <FiPlus size={15} /> Add Product
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="mm-cust-grid">
                {currentProducts.map((product) => (
                  <div key={product._id} className="mm-card">
                    <div style={{ position: 'relative', height: '180px', background: '#F8FAFC', borderBottom: '1px solid #EEF2F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {product.outfitStyleRefImg && product.outfitStyleRefImg.length > 0 ? (
                        <img
                          src={product.outfitStyleRefImg[0]}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <FiPackage size={42} color="#CBD5E1" />
                      )}
                      {product.collection && (
                        <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.75)', color: '#FFFFFF', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                          {product.collection}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {product.outfitTypeName && (
                          <span className="mm-outfit-tag">
                            {product.outfitTypeName}
                          </span>
                        )}
                        {product.subCategoryName && (
                          <span className="mm-cust-tag" style={{ background: '#F1F5F9', color: '#475569', borderColor: '#E2E8F0' }}>
                            <FiTag size={10} /> {product.subCategoryName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mm-cust-actions">
                      {canView && (
                        <button
                          className="mm-btn-ghost primary-tint"
                          onClick={() => navigate(`/products/view/${product._id}`)}
                          title="View Details"
                        >
                          <FiEye size={13} /> View
                        </button>
                      )}
                      {canAddEdit && (
                        <button
                          className="mm-btn-ghost"
                          onClick={() => navigate(`/products/edit/${product._id}`)}
                          title="Edit Product"
                        >
                          <FiEdit2 size={13} /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="mm-btn-ghost"
                          onClick={() => handleDeleteProduct(product._id)}
                          title="Delete Product"
                          style={{ color: '#DC2626' }}
                        >
                          <FiTrash2 size={13} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Table View */
              <div className="mm-table-wrapper">
                <table className="mm-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Thumbnail</th>
                      <th
                        onClick={() => handleSort('name')}
                        className="mm-th-sortable"
                      >
                        Product Name <span className="mm-th-sort-icon">{getSortIcon('name')}</span>
                      </th>
                      <th
                        onClick={() => handleSort('collection')}
                        className="mm-th-sortable"
                      >
                        Collection <span className="mm-th-sort-icon">{getSortIcon('collection')}</span>
                      </th>
                      <th
                        onClick={() => handleSort('outfitTypeName')}
                        className="mm-th-sortable"
                      >
                        Outfit Type <span className="mm-th-sort-icon">{getSortIcon('outfitTypeName')}</span>
                      </th>
                      <th
                        onClick={() => handleSort('subCategoryName')}
                        className="mm-th-sortable"
                      >
                        Subcategory <span className="mm-th-sort-icon">{getSortIcon('subCategoryName')}</span>
                      </th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div className="mm-prod-thumb">
                            {product.outfitStyleRefImg && product.outfitStyleRefImg.length > 0 ? (
                              <img
                                src={product.outfitStyleRefImg[0]}
                                alt={product.name}
                              />
                            ) : (
                              <FiPackage size={20} color="#94A3B8" />
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="customer-name-text" style={{ fontWeight: '700' }}>
                            {product.name}
                          </div>
                        </td>
                        <td>
                          <span className="mm-outfit-tag">
                            {product.collection || 'Standard'}
                          </span>
                        </td>
                        <td>{product.outfitTypeName || '-'}</td>
                        <td>{product.subCategoryName || '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {canView && (
                              <button
                                className="mm-table-action-btn"
                                onClick={() => navigate(`/products/view/${product._id}`)}
                                title="View Details"
                              >
                                <FiEye size={14} />
                              </button>
                            )}
                            {canAddEdit && (
                              <button
                                className="mm-table-action-btn"
                                onClick={() => navigate(`/products/edit/${product._id}`)}
                                title="Edit Product"
                              >
                                <FiEdit2 size={14} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="mm-table-action-btn"
                                onClick={() => handleDeleteProduct(product._id)}
                                title="Delete Product"
                                style={{ color: '#DC2626' }}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #EEF2F6', display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Product;
