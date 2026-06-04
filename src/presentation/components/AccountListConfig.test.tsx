import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AccountListConfig from './AccountListConfig'
import { Account } from '@/core/domain/entities'

const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Boursorama',
    type: 'CHECKING',
    balance: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Livret A',
    type: 'SAVINGS',
    balance: 5000,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

describe('AccountListConfig', () => {
  it('affiche la liste des comptes', () => {
    render(
      <AccountListConfig 
        accounts={mockAccounts} 
        onCreate={vi.fn()} 
        onUpdate={vi.fn()} 
        onDelete={vi.fn()} 
      />
    )
    
    expect(screen.getByText('Boursorama')).toBeInTheDocument()
    expect(screen.getByText('Livret A')).toBeInTheDocument()
    expect(screen.getByText('1 000 €')).toBeInTheDocument()
    expect(screen.getByText('5 000 €')).toBeInTheDocument()
  })

  it('affiche le formulaire d\'ajout au clic sur le bouton', () => {
    render(
      <AccountListConfig 
        accounts={[]} 
        onCreate={vi.fn()} 
        onUpdate={vi.fn()} 
        onDelete={vi.fn()} 
      />
    )
    
    const addButton = screen.getByText(/Ajouter un compte/i)
    fireEvent.click(addButton)
    
    expect(screen.getByPlaceholderText(/Ex: Boursorama Joint/i)).toBeInTheDocument()
    expect(screen.getByText('Nom du compte')).toBeInTheDocument()
  })

  it('appelle onCreate avec les bonnes données', () => {
    const onCreateMock = vi.fn()
    render(
      <AccountListConfig 
        accounts={[]} 
        onCreate={onCreateMock} 
        onUpdate={vi.fn()} 
        onDelete={vi.fn()} 
      />
    )
    
    fireEvent.click(screen.getByText(/Ajouter un compte/i))
    
    const input = screen.getByPlaceholderText(/Ex: Boursorama Joint/i)
    fireEvent.change(input, { target: { value: 'Nouveau Compte' } })
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'SAVINGS' } })
    
    fireEvent.click(screen.getByText('Valider'))
    
    expect(onCreateMock).toHaveBeenCalledWith({
      name: 'Nouveau Compte',
      type: 'SAVINGS',
      balance: 0
    })
  })

  it('appelle onDelete au clic sur le bouton poubelle', () => {
    const onDeleteMock = vi.fn()
    render(
      <AccountListConfig 
        accounts={mockAccounts} 
        onCreate={vi.fn()} 
        onUpdate={vi.fn()} 
        onDelete={onDeleteMock} 
      />
    )
    
    // On prend le premier bouton trash
    const deleteButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg.lucide-trash2'))
    fireEvent.click(deleteButtons[0])
    
    expect(onDeleteMock).toHaveBeenCalledWith('1')
  })
})
