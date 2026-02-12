import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Users, UserPlus, Mail, Shield, Clock, Key } from 'lucide-react';

export function UserManagement() {
  const { user } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [joinCode] = useState('FARM-2024-XYZ');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // For now, show only current user until team management is implemented
  const mockUsers = user ? [{
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: 'owner' as const,
    joinDate: user.created_at || new Date().toISOString(),
    status: 'active' as const
  }] : [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-emerald-100 text-emerald-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const activeUsers = mockUsers.filter(user => user.status === 'active').length;
  const pendingUsers = mockUsers.filter(user => user.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button 
          onClick={() => setShowInviteForm(true)}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <UserPlus size={16} />
          <span>Invite User</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-800">{mockUsers.length}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div>
            <p className="text-green-700 font-medium">Active Users</p>
            <p className="text-2xl font-bold text-green-800">{activeUsers}</p>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div>
            <p className="text-yellow-700 font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-800">{pendingUsers}</p>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div>
            <p className="text-purple-700 font-medium">Owners</p>
            <p className="text-2xl font-bold text-purple-800">
              {mockUsers.filter(u => u.role === 'owner').length}
            </p>
          </div>
        </div>
      </div>

      {/* Join Code */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Key className="text-green-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Farm Invitation Code</h3>
              <p className="text-sm text-gray-600">Share this code with new team members</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white border-2 border-green-300 rounded-lg px-4 py-2">
              <code className="text-lg font-mono font-bold text-green-800">{joinCode}</code>
            </div>
            <p className="text-xs text-gray-500 mt-1">Expires in 7 days</p>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {mockUsers.map(user => (
            <div key={user.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{user.email || ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield size={14} className="text-gray-400" />
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      {user.status === 'pending' && (
                        <Clock size={14} className="text-yellow-500" />
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(user.joinDate || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permissions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="text-purple-600" size={20} />
              <h4 className="font-semibold text-purple-800">Owner</h4>
            </div>
            <ul className="space-y-1 text-sm text-purple-700">
              <li>• Full system access</li>
              <li>• User management</li>
              <li>• Financial data</li>
              <li>• Equipment management</li>
              <li>• Field operations</li>
            </ul>
          </div>

          <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="text-emerald-600" size={20} />
              <h4 className="font-semibold text-emerald-800">Manager</h4>
            </div>
            <ul className="space-y-1 text-sm text-emerald-700">
              <li>• Operations oversight</li>
              <li>• Inventory and equipment</li>
              <li>• Field and harvest data</li>
              <li>• Limited finance access</li>
              <li>• Cannot manage users</li>
            </ul>
          </div>

          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="text-blue-600" size={20} />
              <h4 className="font-semibold text-blue-800">Editor</h4>
            </div>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Field management</li>
              <li>• Inventory updates</li>
              <li>• Equipment status</li>
              <li>• Limited finances</li>
              <li>• Cannot manage users</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="text-gray-600" size={20} />
              <h4 className="font-semibold text-gray-800">Viewer</h4>
            </div>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• View field status</li>
              <li>• View inventory</li>
              <li>• View equipment</li>
              <li>• Read-only access</li>
              <li>• Cannot edit data</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Invite Team Member</h3>
                <button 
                  onClick={() => setShowInviteForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form
                className="space-y-4"
                onSubmit={event => {
                  event.preventDefault();
                  setInviteSuccess(`Invitation sent to ${inviteEmail.trim() || 'team member'}.`);
                  setInviteEmail('');
                  setInviteRole('viewer');
                  setInviteMessage('');
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={event => setInviteEmail(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="colleague@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={event => setInviteRole(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="manager">Manager</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message (Optional)</label>
                  <textarea 
                    value={inviteMessage}
                    onChange={event => setInviteMessage(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 h-20" 
                    placeholder="Welcome to our farm management team!"
                  />
                </div>

                {inviteSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                    {inviteSuccess}
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Send Invitation
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowInviteForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}